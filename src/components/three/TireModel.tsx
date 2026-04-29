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

  // ── THEME PALETTE ────────────────────────────────────────────────────────
  // Dark:  purple outer + cyan inner  (matches reference image)
  // Light: indigo outer + sky-blue inner  (still holographic on white bg)
  const outerColor = isDark ? '#c084fc' : '#818cf8'   // purple / indigo
  const outerEmit  = isDark ? '#a855f7' : '#6366f1'
  const innerColor = isDark ? '#38bdf8' : '#22d3ee'   // sky / cyan
  const innerEmit  = isDark ? '#06b6d4' : '#0891b2'
  const hubColor   = isDark ? '#e879f9' : '#a78bfa'   // kept for type-safety, unused
  const hubEmit    = isDark ? '#d946ef' : '#7c3aed'

  // ── MATERIALS ─────────────────────────────────────────────────────────────

  // Outer tread wireframe
  const treadWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    wireframe: true, color: outerColor,
  }), [outerColor])

  const treadInnerMat = useMemo(() => new THREE.MeshBasicMaterial({
    wireframe: true, color: outerEmit,
  }), [outerEmit])

  // Tread glow fill (transparent solid — gives the bloom fill)
  const treadGlowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: outerColor,
    emissive: outerEmit,
    emissiveIntensity: isDark ? 0.35 : 0.18,
    transparent: true,
    opacity: isDark ? 0.06 : 0.03,
    depthWrite: false,
  }), [isDark, outerColor, outerEmit])

  // Rim wireframe
  const rimWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    wireframe: true, color: innerColor,
  }), [innerColor])

  // Spoke wireframe
  const spokeWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    wireframe: true, color: innerColor,
  }), [innerColor])

  // Spoke glow fill
  const spokeGlowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: innerColor,
    emissive: innerEmit,
    emissiveIntensity: isDark ? 0.7 : 0.35,
    transparent: true,
    opacity: isDark ? 0.18 : 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [isDark, innerColor, innerEmit])

  void hubColor; void hubEmit

  // 10 spoke angles
  const spokeAngles = useMemo(
    () => Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10),
    []
  )

  useFrame((state) => {
    const group = groupRef.current

    if (group) {
      group.rotation.x = 0.38 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04
      group.rotation.y = state.clock.elapsedTime * 0.22
    }

    // Pulse tread glow
    treadGlowMat.opacity = isDark
      ? Math.abs(Math.sin(state.clock.elapsedTime * 0.9)) * 0.04 + 0.04
      : Math.abs(Math.sin(state.clock.elapsedTime * 0.9)) * 0.02 + 0.02
  })

  return (
    <group ref={groupRef} name="tireGroup" scale={[0.78, 0.78, 0.78]}>

      {/* ── TREAD: 3 layered wireframe torii for the dense grid look ── */}
      <mesh material={treadWireMat}>
        <torusGeometry args={[1.8, 0.52, 24, 80]} />
      </mesh>
      <mesh material={treadInnerMat} scale={[0.965, 0.965, 0.965]}>
        <torusGeometry args={[1.8, 0.46, 18, 60]} />
      </mesh>
      <mesh material={treadWireMat} scale={[1.018, 1.018, 1.018]}>
        <torusGeometry args={[1.8, 0.54, 10, 44]} />
      </mesh>
      <mesh material={treadGlowMat}>
        <torusGeometry args={[1.8, 0.52, 24, 80]} />
      </mesh>

      {/* ── SIDEWALL RINGS (front & back) ── */}
      {[0.5, -0.5].map((z, i) => (
        <group key={`sidewall-${i}`}>
          <mesh material={rimWireMat} position={[0, 0, z]}>
            <torusGeometry args={[1.5, 0.04, 8, 64]} />
          </mesh>
          <mesh material={rimWireMat} position={[0, 0, z]}>
            <torusGeometry args={[1.28, 0.035, 8, 64]} />
          </mesh>
        </group>
      ))}

      {/* Rim inner ring detail only */}
      <mesh material={rimWireMat}>
        <torusGeometry args={[0.92, 0.028, 6, 48]} />
      </mesh>

      {/* ── 10 SPOKES ── */}
      {spokeAngles.map((angle, i) => (
        <group key={`spoke-${i}`} rotation={[0, 0, angle]}>
          <mesh material={spokeGlowMat} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.065, 0.7, 0.9]} />
          </mesh>
          <mesh material={spokeWireMat} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.065, 0.7, 0.9]} />
          </mesh>
        </group>
      ))}

    </group>
  )
}