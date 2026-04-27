import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

interface DashboardCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  badge?: React.ReactNode
  className?: string
  techBorder?: boolean
  glow?: 'accent' | 'critical' | 'warning' | null
  delay?: number
}

export default function DashboardCard({
  children,
  title,
  subtitle,
  badge,
  className = '',
  techBorder = false,
  glow = null,
  delay = 0,
}: DashboardCardProps) {
  const { prefersReducedMotion } = useTheme()

  const glowStyle = glow === 'accent' ? 'glow-accent'
    : glow === 'critical' ? 'glow-critical'
    : glow === 'warning' ? 'glow-warning'
    : ''

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2 } }}
      className={`glass-card ${techBorder ? 'tech-border' : ''} ${glowStyle} p-5 ${className}`}
    >
      {(title || badge) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3
                className="text-sm font-display font-semibold tracking-wider"
                style={{ color: 'var(--tg-text-primary)' }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--tg-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>
      )}
      {children}
    </motion.div>
  )
}

// ═══ KPI Metric Card ═══
interface MetricCardProps {
  label: string
  value: string
  unit?: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  delay?: number
}

export function MetricCard({ label, value, unit, change, changeType = 'neutral', icon, delay = 0 }: MetricCardProps) {
  const { prefersReducedMotion } = useTheme()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card tech-border p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-display tracking-[0.15em] uppercase"
              style={{ color: 'var(--tg-text-muted)' }}>
          {label}
        </span>
        {icon && (
          <div className="p-1.5 rounded-lg" style={{ background: 'var(--tg-hover-bg)' }}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-mono-data font-medium"
              style={{ color: 'var(--tg-text-primary)' }}>
          {value}
        </span>
        {unit && (
          <span className="text-xs" style={{ color: 'var(--tg-text-muted)' }}>{unit}</span>
        )}
      </div>
      {change && (
        <p className="text-[11px] mt-1.5 font-mono-data"
           style={{
             color: changeType === 'positive' ? 'var(--tg-safe)'
               : changeType === 'negative' ? 'var(--tg-critical)'
               : 'var(--tg-text-muted)',
           }}>
          {change}
        </p>
      )}
    </motion.div>
  )
}
