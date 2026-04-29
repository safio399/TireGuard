import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useFrame } from '@react-three/fiber'

interface TireModelProps {
  tire?: unknown
  isDark?: boolean
  isXray?: boolean
  faultActive?: boolean
  prefersReducedMotion?: boolean
}

export default function TireModel(_props: TireModelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const groupRef = useRef<THREE.Group>(null)
  const primaryFaultRef = useRef<THREE.Mesh>(null)

  const outerHoloMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        wireframe: true,
        color: '#00f5ff',
        emissive: '#00f5ff',
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    [isDark]
  )

  const midRingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        wireframe: true,
        color: '#4d4dff',
        emissive: '#4d4dff',
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    [isDark]
  )

  const treadMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? '#0d0d0d' : '#d1d5db',
        roughness: isDark ? 0.95 : 0.85,
        metalness: isDark ? 0.05 : 0.1,
        wireframe: false,
        depthWrite: true,
      }),
    [isDark]
  )

  const steelBeltMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        wireframe: true,
        color: isDark ? '#1e3a5f' : '#6b7280',
        emissive: isDark ? '#00f5ff' : '#00f5ff',
        emissiveIntensity: isDark ? 0.15 : 0,
        transparent: true,
        opacity: isDark ? 0.6 : 0.4,
        depthWrite: false,
      }),
    [isDark]
  )

  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? '#0a0f1e' : '#e5e7eb',
        metalness: isDark ? 0.9 : 0.7,
        roughness: isDark ? 0.1 : 0.2,
        emissive: isDark ? '#00f5ff' : '#000000',
        emissiveIntensity: isDark ? 0.08 : 0,
        depthWrite: true,
      }),
    [isDark]
  )

  const spokeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? '#1e293b' : '#9ca3af',
        metalness: isDark ? 0.95 : 0.8,
        roughness: isDark ? 0.05 : 0.1,
        emissive: isDark ? '#4d4dff' : '#000000',
        emissiveIntensity: isDark ? 0.1 : 0,
        depthWrite: true,
      }),
    [isDark]
  )

  const primaryFaultMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? '#ff0055' : '#dc2626',
        emissive: isDark ? '#ff0055' : '#000000',
        emissiveIntensity: isDark ? 1.5 : 0,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    [isDark]
  )

  const secondaryFaultMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? '#f0ab00' : '#d97706',
        emissive: isDark ? '#f0ab00' : '#000000',
        emissiveIntensity: isDark ? 0.8 : 0,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    [isDark]
  )

  const lineMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff0055',
        emissive: '#ff0055',
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    []
  )

  const angles = useMemo(() => [0, Math.PI * 0.6, Math.PI * 1.1], [])
  const primaryAngle = angles[0]
  const primaryPos = useMemo(
    () => [Math.cos(primaryAngle) * 1.8, Math.sin(primaryAngle) * 1.8, 0] as const,
    [primaryAngle]
  )

  useFrame((state) => {
    const group = groupRef.current
    const primaryFault = primaryFaultRef.current

    if (group) {
      group.rotation.y = state.clock.elapsedTime * 0.2
      group.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.06
    }

    const alpha = Math.sin(state.clock.elapsedTime * 1.2) * 0.05 + 0.13
    outerHoloMat.opacity = THREE.MathUtils.clamp(alpha, 0.08, 0.18)

    const midRing = group?.getObjectByName('midRing')
    if (midRing) {
      midRing.rotation.z = -state.clock.elapsedTime * 0.15
    }

    if (primaryFault && primaryFault.material instanceof THREE.MeshStandardMaterial) {
      primaryFault.material.opacity =
        Math.abs(Math.sin(state.clock.elapsedTime * 2.5)) * 0.4 + 0.5
    }

    const dataLine = group?.getObjectByName('dataLine')
    if (dataLine && 'material' in dataLine) {
      const lineMaterial = dataLine.material as THREE.MeshStandardMaterial
      lineMaterial.opacity =
        Math.abs(Math.sin(state.clock.elapsedTime * 2.5)) * 0.4 + 0.4
    }
  })

  return (
    <group ref={groupRef} name="tireGroup">
      <mesh
        name="outerHolo"
        material={isDark ? outerHoloMat : undefined}
        scale={[1.04, 1.04, 1.04]}
        visible={isDark}
      >
        <torusGeometry args={[1.85, 0.55, 8, 64]} />
      </mesh>

      <mesh
        name="midRing"
        material={isDark ? midRingMat : undefined}
        scale={[1.01, 1.01, 1.01]}
        visible={isDark}
      >
        <torusGeometry args={[1.8, 0.48, 12, 80]} />
      </mesh>

      <mesh material={treadMat}>
        <torusGeometry args={[1.8, 0.5, 48, 100]} />
      </mesh>

      <mesh material={steelBeltMat}>
        <torusGeometry args={[1.8, 0.44, 20, 60]} />
      </mesh>

      <mesh material={rimMat}>
        <cylinderGeometry args={[0.85, 0.85, 0.5, 32]} />
      </mesh>

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={`spoke-${i}`}
          material={spokeMat}
          position={[0, 0, -0.25]}
          rotation={[0, 0, (i * Math.PI) / 2]}
        >
          <boxGeometry args={[0.08, 1.6, 0.06]} />
        </mesh>
      ))}

      {angles.map((angle, i) => {
        const x = Math.cos(angle) * 1.8
        const y = Math.sin(angle) * 1.8
        const isPrimary = i === 0

        return (
          <mesh
            key={`fault-${i}`}
            material={isPrimary ? primaryFaultMat : secondaryFaultMat}
            position={[x, y, 0.6]}
            ref={isPrimary ? primaryFaultRef : undefined}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
        )
      })}

      {isDark && (
        <mesh
          name="dataLine"
          material={lineMat}
          position={[primaryPos[0], primaryPos[1], 1.0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[0.004, 0.004, 1.2, 8]} />
        </mesh>
      )}
    </group>
  )
}
