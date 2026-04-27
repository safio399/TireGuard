import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Tire } from '../../types'
import type { PredictionStatus } from '../../types/prediction'

const PARTICLE_OFFSETS = [
  [-0.12, -0.04, 0.08],
  [0.09, 0.03, -0.06],
  [-0.05, 0.11, 0.04],
  [0.13, -0.07, 0.02],
  [-0.08, 0.06, -0.09],
  [0.04, -0.12, 0.1],
  [0.11, 0.08, -0.03],
  [-0.1, 0.02, -0.11],
  [0.02, 0.13, 0.07],
  [-0.03, -0.09, 0.12],
] as const

interface TireCanvasProps {
  tire?: Tire | null
  theme: 'light' | 'dark'
  isXray: boolean
  predictionStatus?: PredictionStatus
  enableZoom?: boolean
  enablePan?: boolean
  autoRotate?: boolean
  prefersReducedMotion?: boolean
}

interface TireModelProps {
  tire?: Tire | null
  isDark: boolean
  isXray: boolean
  faultActive?: boolean
  prefersReducedMotion?: boolean
}

export default function TireCanvas({
  tire,
  theme,
  isXray,
  predictionStatus,
  enableZoom = true,
  enablePan = false,
  autoRotate = true,
  prefersReducedMotion = false,
}: TireCanvasProps) {
  const isDark = theme === 'dark'
  const faultActive = predictionStatus === 'Failure Risk'

  return (
    <Canvas
      camera={{ position: [3, 2, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={isDark ? 0.16 : 0.55} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.45 : 0.85} color={isDark ? '#ffffff' : '#f8fafc'} />
      <pointLight position={[2.2, 1.4, 2.1]} intensity={isDark ? 0.75 : 0.45} color={isDark ? '#00F5FF' : '#0D9488'} distance={8} />
      <pointLight
        position={[-2.2, -1.2, -2]}
        intensity={faultActive ? 0.55 : 0.25}
        color={faultActive ? '#DC2626' : isDark ? '#2563EB' : '#94A3B8'}
        distance={6}
      />

      <Environment preset={isDark ? 'night' : 'studio'} />

      <TireModel
        tire={tire}
        isDark={isDark}
        isXray={isXray}
        faultActive={faultActive}
        prefersReducedMotion={prefersReducedMotion}
      />

      <OrbitControls
        enablePan={enablePan}
        enableZoom={enableZoom}
        minDistance={2.5}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        dampingFactor={0.05}
        enableDamping
      />

      <gridHelper
        args={[10, 20, isDark ? '#11253a' : '#d5e8ec', isDark ? '#08111d' : '#e8f3f5']}
        position={[0, -1.25, 0]}
      />
    </Canvas>
  )
}

function TireModel({
  tire,
  isDark,
  isXray,
  faultActive = false,
  prefersReducedMotion = false,
}: TireModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const scanLineRef = useRef<THREE.Mesh>(null)
  const markerMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const dangerShellRef = useRef<THREE.Mesh>(null)

  const riskLevel = tire?.level || 'safe'

  const colors = useMemo(() => ({
    accent: isDark ? '#00F5FF' : '#0D9488',
    critical: isDark ? '#FF0055' : '#DC2626',
    warning: isDark ? '#F0AB00' : '#D97706',
    safe: isDark ? '#00F5FF' : '#059669',
    rubber: isDark ? '#16181d' : '#d6dae0',
    rim: isDark ? '#2a2f3a' : '#dde3ea',
    rimInner: isDark ? '#101826' : '#edf2f7',
    wireframe: isDark ? '#00F5FF' : '#0D9488',
  }), [isDark])

  const statusColor = useMemo(() => {
    if (faultActive) return colors.critical
    switch (riskLevel) {
      case 'critical':
        return colors.critical
      case 'elevated':
      case 'warn':
        return colors.warning
      default:
        return colors.safe
    }
  }, [colors, faultActive, riskLevel])

  const faultPositions = useMemo(() => {
    if (!tire?.faultZones || riskLevel === 'safe') return null
    const positions = new Float32Array(tire.faultZones.length * 30 * 3)
    let index = 0
    for (const fault of tire.faultZones) {
      for (let i = 0; i < 30; i += 1) {
        const offset = PARTICLE_OFFSETS[i % PARTICLE_OFFSETS.length]
        positions[index] = fault.position.x + offset[0]
        positions[index + 1] = fault.position.y + offset[1]
        positions[index + 2] = fault.position.z + offset[2]
        index += 3
      }
    }
    return positions
  }, [riskLevel, tire])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    if (scanLineRef.current) {
      scanLineRef.current.position.y = Math.sin(time * 0.8) * 0.8
      const material = scanLineRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.12 + Math.sin(time * 2) * 0.04
    }

    if (groupRef.current) {
      if (faultActive && !prefersReducedMotion) {
        groupRef.current.position.x = Math.sin(time * 50) * 0.02
        groupRef.current.position.y = Math.sin(time * 50 + Math.PI / 2) * 0.02
      } else {
        groupRef.current.position.x = 0
        groupRef.current.position.y = Math.sin(time * 0.5) * 0.03
      }
    }

    if (markerMaterialRef.current) {
      markerMaterialRef.current.emissiveIntensity = faultActive
        ? 1.4 + Math.sin(time * 4) * 0.35
        : 0.7
    }

    if (dangerShellRef.current) {
      const material = dangerShellRef.current.material as THREE.MeshBasicMaterial
      material.opacity = faultActive
        ? prefersReducedMotion ? 0.15 : 0.12 + (Math.sin(time * 2.5) + 1) * 0.025
        : 0
    }
  })

  return (
    <group ref={groupRef}>
      {faultActive && (
        <mesh ref={dangerShellRef}>
          <sphereGeometry args={[2.3, 36, 36]} />
          <meshBasicMaterial
            color={colors.critical}
            transparent
            opacity={0.15}
            wireframe={!isDark}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <mesh>
        <torusGeometry args={[0.85, 0.35, 32, 96]} />
        {isXray ? (
          <meshBasicMaterial color={colors.wireframe} wireframe transparent opacity={0.38} />
        ) : (
          <meshStandardMaterial color={colors.rubber} roughness={0.88} metalness={0.06} envMapIntensity={isDark ? 0.3 : 0.45} />
        )}
      </mesh>

      <mesh>
        <torusGeometry args={[0.85, 0.36, 8, 80]} />
        <meshStandardMaterial color={colors.rubber} roughness={0.9} metalness={0} wireframe transparent opacity={isXray ? 0.26 : 0.18} />
      </mesh>

      <mesh>
        <torusGeometry args={[0.85, 0.25, 20, 72]} />
        <meshBasicMaterial color={colors.wireframe} wireframe transparent opacity={isDark ? 0.18 : 0.14} />
      </mesh>

      <mesh>
        <torusGeometry args={[0.85, 0.39, 32, 96]} />
        <meshBasicMaterial
          color={faultActive ? colors.critical : colors.accent}
          transparent
          opacity={faultActive ? (isDark ? 0.09 : 0.11) : (isDark ? 0.14 : 0.1)}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.52, 0.52, 0.35, 32]} />
        <meshStandardMaterial color={colors.rim} roughness={0.3} metalness={0.7} envMapIntensity={isDark ? 0.6 : 0.8} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.36, 32]} />
        <meshStandardMaterial color={colors.rimInner} roughness={0.4} metalness={0.55} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.37, 16]} />
        <meshStandardMaterial color={colors.rim} roughness={0.2} metalness={0.8} />
      </mesh>

      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const radians = (angle * Math.PI) / 180
        const x = Math.cos(radians) * 0.33
        const z = Math.sin(radians) * 0.33
        return (
          <mesh key={angle} position={[x, 0, z]} rotation={[0, -radians, 0]}>
            <boxGeometry args={[0.04, 0.34, 0.33]} />
            <meshStandardMaterial color={colors.rim} roughness={0.25} metalness={0.75} />
          </mesh>
        )
      })}

      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.36, 0]}>
        <torusGeometry args={[0.85, 0.005, 4, 64, Math.PI * 0.3]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.6} />
      </mesh>

      <mesh position={[0.88, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
        <meshStandardMaterial color={colors.rim} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh ref={scanLineRef} position={[0, 0, 0]}>
        <planeGeometry args={[3, 0.02]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {faultActive && (
        <mesh position={[1.8, 0, 0]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            ref={markerMaterialRef}
            color={colors.critical}
            emissive={new THREE.Color(colors.critical)}
            emissiveIntensity={1.2}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
      )}

      {faultPositions && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[faultPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial color={statusColor} size={0.015} transparent opacity={0.6} sizeAttenuation />
        </points>
      )}
    </group>
  )
}
