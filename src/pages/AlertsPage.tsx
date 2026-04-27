import { useState, useMemo } from 'react'
import { useTireData } from '../context/DataContext'
import DashboardCard from '../components/dashboard/DashboardCard'
import { AlertFeed } from '../components/alerts/AlertCard'
import { AlertTriangle, Shield, Bell } from 'lucide-react'

export default function AlertsPage() {
  const { data } = useTireData()
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return data.alerts
    return data.alerts.filter(a => a.severity === filter)
  }, [data.alerts, filter])

  const criticalCount = data.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
  const warningCount = data.alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length

  const handleAcknowledge = (id: string) => {
    // In a real app this would update state
    console.log('Acknowledge alert:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          ALERTS
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          {data.alerts.length} total · {criticalCount + warningCount} active
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: 'all' as const, label: 'All', count: data.alerts.length },
          { key: 'critical' as const, label: 'Critical', count: criticalCount, color: 'var(--tg-critical)' },
          { key: 'warning' as const, label: 'Warning', count: warningCount, color: 'var(--tg-warning)' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-display tracking-wider transition-all duration-200"
            style={{
              background: filter === tab.key ? 'var(--tg-active-bg)' : 'var(--tg-hover-bg)',
              color: filter === tab.key ? (tab.color || 'var(--tg-accent)') : 'var(--tg-text-secondary)',
              border: `1px solid ${filter === tab.key ? (tab.color || 'var(--tg-accent)') : 'var(--tg-border)'}`,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DashboardCard delay={0}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(var(--tg-critical-rgb), 0.1)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--tg-critical)' }} />
            </div>
            <div>
              <p className="text-[10px] font-display tracking-wider uppercase"
                 style={{ color: 'var(--tg-text-muted)' }}>Critical</p>
              <p className="text-2xl font-mono-data font-medium"
                 style={{ color: 'var(--tg-critical)' }}>{criticalCount}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(var(--tg-warning-rgb), 0.1)' }}>
              <Bell className="h-5 w-5" style={{ color: 'var(--tg-warning)' }} />
            </div>
            <div>
              <p className="text-[10px] font-display tracking-wider uppercase"
                 style={{ color: 'var(--tg-text-muted)' }}>Warnings</p>
              <p className="text-2xl font-mono-data font-medium"
                 style={{ color: 'var(--tg-warning)' }}>{warningCount}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(var(--tg-safe-rgb), 0.1)' }}>
              <Shield className="h-5 w-5" style={{ color: 'var(--tg-safe)' }} />
            </div>
            <div>
              <p className="text-[10px] font-display tracking-wider uppercase"
                 style={{ color: 'var(--tg-text-muted)' }}>Acknowledged</p>
              <p className="text-2xl font-mono-data font-medium"
                 style={{ color: 'var(--tg-text-primary)' }}>
                {data.alerts.filter(a => a.acknowledged).length}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Alert feed */}
      <AlertFeed alerts={filtered} onAcknowledge={handleAcknowledge} />
    </div>
  )
}
