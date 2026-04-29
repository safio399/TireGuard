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
        background: isDark
          ? 'radial-gradient(ellipse at center, rgba(168,85,247,0.06) 0%, rgba(0,245,255,0.03) 40%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(99,102,241,0.05) 0%, transparent 65%)',
      }}
    >
      {hasWebGL ? (
        <Canvas
          // Angled camera — shows the torus as a 3-D shape, not a flat circle
          camera={{ position: [3.5, 2.2, 3.5], fov: 42 }}
          gl={{ antialias: true }}
          shadows={false}
        >
          <TireModel />

          {/* Ambient — brighter in light mode so wireframes read on white */}
          <ambientLight intensity={isDark ? 0.4 : 0.8} />

          {/* Key light */}
          <pointLight
            position={[4, 3, 4]}
            intensity={isDark ? 1.2 : 0.6}
            color={isDark ? '#ffffff' : '#f0f4ff'}
          />

          {/* Rim accent: purple in dark, indigo in light */}
          <pointLight
            position={[-4, 2, -3]}
            color={isDark ? '#a855f7' : '#6366f1'}
            intensity={isDark ? 1.8 : 0.5}
          />

          {/* Tread accent: cyan */}
          <pointLight
            position={[0, -3, 2]}
            color={isDark ? '#06b6d4' : '#0ea5e9'}
            intensity={isDark ? 1.0 : 0.3}
          />

          <OrbitControls
            enablePan={enablePan}
            enableZoom={enableZoom}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            // No autoRotate here — TireModel drives its own rotation in useFrame
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