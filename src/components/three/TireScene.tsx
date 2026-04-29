import { AlertTriangle } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTheme } from '../../context/ThemeContext'
import type { Tire } from '../../types'
import type { PredictionStatus } from '../../types/prediction'
import TireModel from './TireModel'

interface TireSceneProps {
  tire?: Tire | null
  className?: string
  showControls?: boolean
  predictionStatus?: PredictionStatus
  enableZoom?: boolean
  enablePan?: boolean
  autoRotate?: boolean
}

export default function TireScene({
  className = '',
  enableZoom = false,
  enablePan = false,
}: TireSceneProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const hasWebGL = typeof window !== 'undefined' && !!window.WebGLRenderingContext

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: isDark && hasWebGL
          ? 'radial-gradient(ellipse at center, rgba(0,245,255,0.04) 0%, transparent 70%)'
          : 'transparent',
      }}
    >
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ antialias: true }}
          shadows={false}
        >
          <TireModel />
          <ambientLight intensity={isDark ? 0.15 : 0.35} />
          <pointLight position={[3, 2, 3]} intensity={isDark ? 2 : 0.8} />
          <pointLight
            position={[-5, 2, -3]}
            color={isDark ? '#4d4dff' : '#ffffff'}
            intensity={isDark ? 1.5 : 0.3}
          />
          <OrbitControls
            enablePan={enablePan}
            enableZoom={enableZoom}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Canvas>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: 'rgba(var(--tg-warning-rgb), 0.35)',
              background: 'rgba(var(--tg-warning-rgb), 0.08)',
              color: 'var(--tg-warning)',
            }}
          >
            <AlertTriangle className="h-4 w-4" />
            WebGL not supported
          </div>
        </div>
      )}
    </div>
  )
}
