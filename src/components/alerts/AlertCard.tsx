import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Clock, Radio } from 'lucide-react'
import type { TireAlert } from '../../types'

interface AlertCardProps {
  alert: TireAlert
  onAcknowledge?: (id: string) => void
}

export function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const isCritical = alert.severity === 'critical'

  const timeAgo = getTimeAgo(alert.timestamp)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
      className="glass-card p-4 relative overflow-hidden"
      style={{
        borderColor: isCritical
          ? 'rgba(var(--tg-critical-rgb), 0.3)'
          : 'rgba(var(--tg-warning-rgb), 0.2)',
        boxShadow: isCritical
          ? '0 0 24px rgba(var(--tg-critical-rgb), 0.1)'
          : '0 0 16px rgba(var(--tg-warning-rgb), 0.08)',
      }}
    >
      {/* Pulsing radar indicator */}
      {isCritical && !alert.acknowledged && (
        <div className="absolute top-3 right-3">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 rounded-full" style={{ background: 'var(--tg-critical)' }} />
            <div className="absolute inset-0 rounded-full animate-ping"
                 style={{ background: 'var(--tg-critical)', opacity: 0.4 }} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: isCritical
              ? 'rgba(var(--tg-critical-rgb), 0.1)'
              : 'rgba(var(--tg-warning-rgb), 0.1)',
          }}
        >
          <AlertTriangle
            className="h-4 w-4"
            style={{
              color: isCritical ? 'var(--tg-critical)' : 'var(--tg-warning)',
              strokeWidth: 1.5,
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-display font-semibold tracking-[0.15em] uppercase"
              style={{
                color: isCritical ? 'var(--tg-critical)' : 'var(--tg-warning)',
              }}
            >
              {alert.severity}
            </span>
            <span className="text-[10px] font-mono-data flex items-center gap-1"
                  style={{ color: 'var(--tg-text-muted)' }}>
              <Clock className="h-2.5 w-2.5" /> {timeAgo}
            </span>
          </div>

          <p className="text-sm font-medium mb-1"
             style={{ color: 'var(--tg-text-primary)' }}>
            {alert.title}
          </p>

          <p className="text-xs leading-relaxed"
             style={{ color: 'var(--tg-text-secondary)' }}>
            {alert.message}
          </p>

          {/* Metric detail */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-mono-data px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--tg-hover-bg)',
                    color: 'var(--tg-text-secondary)',
                  }}>
              {alert.metric}: <span style={{ color: isCritical ? 'var(--tg-critical)' : 'var(--tg-warning)' }}>
                {alert.value.toFixed(1)}
              </span> / {alert.threshold}
            </span>
            <span className="text-[10px] font-mono-data"
                  style={{ color: 'var(--tg-text-muted)' }}>
              {alert.vehicleId} · {alert.tireId}
            </span>
          </div>
        </div>

        {/* Dismiss */}
        {onAcknowledge && !alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="shrink-0 self-start p-1 rounded-md transition-colors"
            style={{ color: 'var(--tg-text-muted)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {alert.acknowledged && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
             style={{ background: 'rgba(var(--tg-bg-rgb), 0.5)' }} />
      )}
    </motion.div>
  )
}

export function AlertFeed({ alerts, onAcknowledge }: {
  alerts: TireAlert[]
  onAcknowledge?: (id: string) => void
}) {
  const activeAlerts = alerts.filter(a => !a.acknowledged)
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged).slice(0, 3)

  return (
    <div className="space-y-3">
      {activeAlerts.length === 0 && (
        <div className="glass-card p-6 text-center">
          <Radio className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--tg-safe)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--tg-text-primary)' }}>
            All systems nominal
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--tg-text-muted)' }}>
            No active alerts at this time
          </p>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {activeAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
        ))}
      </AnimatePresence>

      {acknowledgedAlerts.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] font-display tracking-[0.15em] uppercase mb-2"
             style={{ color: 'var(--tg-text-muted)' }}>
            Acknowledged
          </p>
          {acknowledgedAlerts.map(alert => (
            <div key={alert.id} className="mb-2 opacity-50">
              <AlertCard alert={alert} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
