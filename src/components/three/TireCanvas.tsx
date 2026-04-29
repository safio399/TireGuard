import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import type { Tire } from '../../types'
import type { PredictionStatus } from '../../types/prediction'
import TireModel from './TireModel'

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

  return (
    <Canvas
      camera={{ position: [3, 2, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={isDark ? 0.16 : 0.55} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.45 : 0.85} color={isDark ? '#ffffff' : '#f8fafc'} />
      <pointLight position={[2.2, 1.4, 2.1]} intensity={isDark ? 0.75 : 0.45} color={isDark ? '#00F5FF' : '#0D9488'} distance={8} />
      <pointLight position={[-5, 2, -3]} intensity={isDark ? 1.5 : 0.3} color="#4d4dff" distance={10} />

      <Environment preset={isDark ? 'night' : 'studio'} />

      <TireModel
        tire={tire}
        isDark={isDark}
        isXray={isXray}
        faultActive={predictionStatus === 'Failure Risk'}
        prefersReducedMotion={prefersReducedMotion}
      />

      <OrbitControls
        enablePan={enablePan}
        enableZoom={enableZoom}
        minDistance={2.5}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
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
