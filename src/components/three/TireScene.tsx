import { Suspense, lazy, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import type { Tire } from '../../types'
import type { PredictionStatus } from '../../types/prediction'

const TireCanvas = lazy(() => import('./TireCanvas'))

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
  tire,
  className = '',
  showControls = true,
  predictionStatus,
  enableZoom = true,
  enablePan = false,
  autoRotate = true,
}: TireSceneProps) {
  const { theme, prefersReducedMotion } = useTheme()
  const [isXray, setIsXray] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<TireSceneSkeleton />}>
        <TireCanvas
          tire={tire}
          theme={theme}
          isXray={isXray}
          predictionStatus={predictionStatus}
          enableZoom={enableZoom}
          enablePan={enablePan}
          autoRotate={autoRotate}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Suspense>

      {showControls && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <button
            onClick={() => setIsXray(!isXray)}
            className="rounded-lg px-3 py-1.5 text-[11px] font-mono-data transition-all duration-200"
            style={{
              background: isXray ? 'rgba(var(--tg-accent-rgb), 0.2)' : 'var(--tg-hover-bg)',
              color: isXray ? 'var(--tg-accent)' : 'var(--tg-text-secondary)',
              border: `1px solid ${isXray ? 'var(--tg-accent)' : 'var(--tg-border)'}`,
            }}
          >
            {isXray ? 'X-RAY ON' : 'X-RAY'}
          </button>
        </div>
      )}

      {tire && (
        <div className="absolute right-4 top-4 z-10 space-y-2">
          <DataLabel label="PSI" value={tire.sensor.pressure.toFixed(1)} level={tire.level} />
          <DataLabel label="F" value={tire.sensor.temperature.toFixed(0)} level={tire.level} />
          <DataLabel label="mm" value={tire.sensor.treadDepth.toFixed(1)} level={tire.level} />
        </div>
      )}
    </div>
  )
}

function DataLabel({ label, value, level }: { label: string; value: string; level: string }) {
  const isAlert = level === 'critical' || level === 'elevated'
  return (
    <div
      className="flex items-baseline gap-1.5 rounded-md px-2 py-1 backdrop-blur-sm"
      style={{
        background: 'rgba(var(--tg-bg-rgb), 0.6)',
        border: `1px solid ${isAlert ? 'rgba(var(--tg-critical-rgb), 0.3)' : 'var(--tg-border)'}`,
      }}
    >
      <span className="font-mono-data text-sm font-medium" style={{ color: isAlert ? 'var(--tg-critical)' : 'var(--tg-accent)' }}>
        {value}
      </span>
      <span className="text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

function TireSceneSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-pulse">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--tg-border)" strokeWidth="2" strokeDasharray="8 4" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="var(--tg-border)" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="15" fill="none" stroke="var(--tg-border)" strokeWidth="1" />
        </svg>
        <span className="text-[10px] font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          Loading 3D model...
        </span>
      </div>
    </div>
  )
}
