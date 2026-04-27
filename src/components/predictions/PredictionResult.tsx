import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/context/ThemeContext'
import type { PredictionResponse } from '@/types/prediction'

interface PredictionResultProps {
  result: PredictionResponse
}

export default function PredictionResult({ result }: PredictionResultProps) {
  const { prefersReducedMotion } = useTheme()
  const targetPercentage = result.failure_probability * 100
  const [animatedValue, setAnimatedValue] = useState(0)
  const displayValue = prefersReducedMotion ? targetPercentage : animatedValue

  useEffect(() => {
    if (prefersReducedMotion) return

    let frame = 0
    let startTime = 0
    const duration = 900

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(targetPercentage * eased)
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion, targetPercentage])

  const progressColor = useMemo(() => {
    if (targetPercentage < 30) return '#059669'
    if (targetPercentage <= 60) return '#D97706'
    return '#FF0055'
  }, [targetPercentage])

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={prefersReducedMotion ? undefined : { type: 'spring', stiffness: 220, damping: 24 }}
    >
      <Card className="glass-card border-border/40 bg-card/40 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
        <div className="space-y-5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-display tracking-[0.2em]" style={{ color: 'var(--tg-text-muted)' }}>
                FAILURE PROBABILITY
              </p>
              <div className="text-4xl font-mono-data font-semibold leading-none" style={{ color: 'var(--tg-text-primary)' }}>
                {displayValue.toFixed(1)}%
              </div>
            </div>

            <Badge
              className="flex items-center gap-2 rounded-full border px-3 py-1 font-mono-data text-[11px] uppercase tracking-[0.14em]"
              style={{
                color: result.status === 'Healthy' ? '#059669' : 'var(--tg-critical)',
                borderColor: result.status === 'Healthy' ? 'rgba(5,150,105,0.3)' : 'rgba(var(--tg-critical-rgb),0.3)',
                background: result.status === 'Healthy' ? 'rgba(5,150,105,0.08)' : 'rgba(var(--tg-critical-rgb),0.08)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: result.status === 'Healthy' ? '#059669' : 'var(--tg-critical)',
                  animation: prefersReducedMotion ? 'none' : 'pulse 1.6s ease-in-out infinite',
                }}
              />
              {result.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-display tracking-[0.16em]" style={{ color: 'var(--tg-text-muted)' }}>
              <span>RISK SCALE</span>
              <span className="font-mono-data">{targetPercentage.toFixed(1)}%</span>
            </div>
            <Progress
              value={targetPercentage}
              className="h-3 rounded-full bg-secondary/70"
              indicatorClassName="prediction-progress-indicator transition-transform duration-700"
              style={{ ['--prediction-progress' as string]: progressColor } as CSSProperties}
            />
            <style>{`.prediction-progress-indicator{background:var(--prediction-progress);}`}</style>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricTile label="Prediction Label" value={String(result.prediction)} />
            <MetricTile label="Response Class" value={result.status === 'Healthy' ? '0xHEALTH' : '0xRISK'} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <p className="text-[10px] font-display tracking-[0.18em]" style={{ color: 'var(--tg-text-muted)' }}>
        {label}
      </p>
      <p className="mt-2 font-mono-data text-sm font-medium" style={{ color: 'var(--tg-text-primary)' }}>
        {value}
      </p>
    </div>
  )
}
