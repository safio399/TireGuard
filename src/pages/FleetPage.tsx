import { useMemo } from 'react'
import { useTireData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import DashboardCard from '../components/dashboard/DashboardCard'
import { getFleetSummary } from '../data/mockTireData'
import { Truck, Activity } from 'lucide-react'
import type { FleetVehicle, TireRiskLevel } from '../types'

const riskOrder: Record<TireRiskLevel, number> = { safe: 0, warn: 1, elevated: 2, critical: 3 }

export default function FleetPage() {
  const { data } = useTireData()
  useTheme()
  const summary = useMemo(() => getFleetSummary(data), [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          FLEET STATUS
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          {summary.totalVehicles} vehicles · {summary.totalTires} tires monitored
        </span>
      </div>

      {/* Vehicle cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.fleet.map((vehicle, i) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} delay={i * 0.05} />
        ))}
      </div>
    </div>
  )
}

function VehicleCard({ vehicle, delay }: { vehicle: FleetVehicle; delay: number }) {
  const worst = vehicle.tires.reduce((w, t) =>
    riskOrder[t.level] > riskOrder[w.level] ? t : w
  )
  const isAlert = worst.level === 'critical' || worst.level === 'elevated'

  return (
    <DashboardCard
      techBorder
      glow={isAlert ? 'critical' : null}
      delay={delay}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg" style={{ background: 'var(--tg-hover-bg)' }}>
            <Truck className="h-4 w-4" style={{ color: 'var(--tg-accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--tg-text-primary)' }}>
              {vehicle.name}
            </p>
            <p className="text-[10px] font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
              {vehicle.plate} · {vehicle.mileage.toLocaleString()} km
            </p>
          </div>
        </div>
        <StatusPill status={vehicle.status} />
      </div>

      {/* 4-tire grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {vehicle.tires.map(t => (
          <div key={t.position}
               className="p-2 rounded-lg text-center"
               style={{ background: 'var(--tg-hover-bg)' }}>
            <p className="text-[9px] font-display tracking-wider uppercase mb-0.5"
               style={{ color: 'var(--tg-text-muted)' }}>
              {t.label}
            </p>
            <p className="text-sm font-mono-data font-medium"
               style={{ color: getLevelColor(t.level) }}>
              {t.sensor.pressure.toFixed(0)} <span className="text-[9px]">PSI</span>
            </p>
            <p className="text-[9px] font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
              {t.sensor.treadDepth.toFixed(1)}mm · {t.sensor.temperature.toFixed(0)}°F
            </p>
          </div>
        ))}
      </div>

      {/* Sync status */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono-data"
           style={{ color: 'var(--tg-text-muted)' }}>
        <Activity className="h-3 w-3"
                  style={{ color: vehicle.syncStatus === 'live' ? 'var(--tg-safe)' : 'var(--tg-warning)' }} />
        {vehicle.syncStatus === 'live' ? 'Live' : vehicle.syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
        <span>· {new Date(vehicle.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </DashboardCard>
  )
}

function StatusPill({ status }: { status: FleetVehicle['status'] }) {
  const styles = {
    active: { bg: 'rgba(var(--tg-safe-rgb), 0.1)', color: 'var(--tg-safe)' },
    maintenance: { bg: 'rgba(var(--tg-warning-rgb), 0.1)', color: 'var(--tg-warning)' },
    standby: { bg: 'var(--tg-hover-bg)', color: 'var(--tg-text-muted)' },
  }[status]

  return (
    <span className="text-[9px] font-display font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
          style={{ background: styles.bg, color: styles.color }}>
      {status}
    </span>
  )
}

function getLevelColor(level: TireRiskLevel): string {
  return {
    safe: 'var(--tg-safe)',
    warn: 'var(--tg-warning)',
    elevated: 'var(--tg-warning)',
    critical: 'var(--tg-critical)',
  }[level]
}
