import { useMemo } from 'react'
import {
  Gauge, Thermometer, Ruler, AlertTriangle, Truck, Shield
} from 'lucide-react'
import { useTireData } from '../context/DataContext'
import { getFleetSummary } from '../data/mockTireData'
import DashboardCard, { MetricCard } from '../components/dashboard/DashboardCard'
import HealthRadar from '../components/dashboard/HealthRadar'
import PredictionChart from '../components/dashboard/PredictionChart'
import TireScene from '../components/three/TireScene'
import { AlertCard } from '../components/alerts/AlertCard'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

export default function Overview() {
  const { data } = useTireData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const summary = useMemo(() => getFleetSummary(data), [data])

  // Pick the most critical tire for the 3D scene
  const criticalTire = useMemo(() => {
    const allTires = data.fleet.flatMap(v => v.tires)
    return allTires.find(t => t.level === 'critical') || allTires.find(t => t.level === 'elevated') || allTires[0]
  }, [data])

  // Find prediction for the critical tire
  const criticalPrediction = useMemo(() => {
    return data.predictions.find(p => p.tireId === criticalTire?.id)
  }, [data, criticalTire])

  // Fleet health distribution
  const healthData = [
    { name: 'Safe', count: summary.safe, color: isDark ? '#00F5FF' : '#059669' },
    { name: 'Watch', count: summary.warn, color: isDark ? '#F0AB00' : '#D97706' },
    { name: 'Elevated', count: summary.elevated, color: isDark ? '#FF6B2C' : '#EA580C' },
    { name: 'Critical', count: summary.critical, color: isDark ? '#FF0055' : '#DC2626' },
  ]

  const topAlerts = data.alerts.filter(a => !a.acknowledged).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          DASHBOARD
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })} · Fleet Zone A
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Active Alerts"
          value={String(summary.activeAlerts)}
          change={summary.critical > 0 ? `${summary.critical} critical` : 'All clear'}
          changeType={summary.critical > 0 ? 'negative' : 'positive'}
          icon={<AlertTriangle className="h-4 w-4" style={{ color: 'var(--tg-critical)' }} />}
          delay={0}
        />
        <MetricCard
          label="Fleet Vehicles"
          value={String(summary.totalVehicles)}
          unit={`/ ${summary.totalTires} tires`}
          change={`${summary.vehiclesInMaintenance} in maintenance`}
          changeType={summary.vehiclesInMaintenance > 0 ? 'negative' : 'neutral'}
          icon={<Truck className="h-4 w-4" style={{ color: 'var(--tg-accent)' }} />}
          delay={0.05}
        />
        <MetricCard
          label="Avg Pressure"
          value={summary.avgPressure.toFixed(1)}
          unit="PSI"
          change="Target: 32-35"
          changeType="neutral"
          icon={<Gauge className="h-4 w-4" style={{ color: 'var(--tg-accent)' }} />}
          delay={0.1}
        />
        <MetricCard
          label="Avg Tread Depth"
          value={summary.avgTreadDepth.toFixed(1)}
          unit="mm"
          change={summary.avgTreadDepth < 4 ? '⚠ Below optimal' : 'Healthy range'}
          changeType={summary.avgTreadDepth < 4 ? 'negative' : 'positive'}
          icon={<Ruler className="h-4 w-4" style={{ color: 'var(--tg-accent)' }} />}
          delay={0.15}
        />
      </div>

      {/* Main content: 3D tire + Health overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Tire Scene */}
        <DashboardCard
          title="TIRE DIAGNOSTIC"
          subtitle={criticalTire ? `${criticalTire.id} · ${criticalTire.label}` : 'Select a tire'}
          className="lg:col-span-2"
          techBorder
          delay={0.2}
        >
          <div className="h-[320px] md:h-[380px] rounded-xl overflow-hidden"
               style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(248,250,252,0.8)' }}>
            <TireScene tire={criticalTire} />
          </div>
        </DashboardCard>

        {/* Health Radar + Quick Stats */}
        <div className="space-y-4">
          <DashboardCard title="HEALTH PROFILE" delay={0.25}>
            {criticalTire && <HealthRadar tire={criticalTire} />}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <MiniStat
                label="PSI"
                value={criticalTire?.sensor.pressure.toFixed(1) || '—'}
                icon={<Gauge className="h-3 w-3" />}
                alert={criticalTire ? criticalTire.sensor.pressure < 27 : false}
              />
              <MiniStat
                label="°F"
                value={criticalTire?.sensor.temperature.toFixed(0) || '—'}
                icon={<Thermometer className="h-3 w-3" />}
                alert={criticalTire ? criticalTire.sensor.temperature > 82 : false}
              />
              <MiniStat
                label="mm"
                value={criticalTire?.sensor.treadDepth.toFixed(1) || '—'}
                icon={<Ruler className="h-3 w-3" />}
                alert={criticalTire ? criticalTire.sensor.treadDepth < 4 : false}
              />
            </div>
          </DashboardCard>

          <DashboardCard title="FLEET HEALTH" delay={0.3}>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={healthData} barSize={24}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fontFamily: '"JetBrains Mono"', fill: 'var(--tg-text-muted)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(10,10,10,0.95)' : '#fff',
                    border: `1px solid var(--tg-border)`,
                    borderRadius: 8, fontSize: 11,
                    fontFamily: '"JetBrains Mono"',
                    boxShadow: 'none',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {healthData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>
      </div>

      {/* Bottom row: Predictions + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prediction Chart */}
        <DashboardCard
          title="TREAD WEAR PREDICTION"
          subtitle={criticalTire ? `${criticalTire.id} · Confidence: ${(criticalTire.confidence * 100).toFixed(0)}%` : ''}
          techBorder
          delay={0.35}
        >
          {criticalPrediction ? (
            <PredictionChart timeline={criticalPrediction} />
          ) : (
            <p className="text-xs" style={{ color: 'var(--tg-text-muted)' }}>No prediction data available</p>
          )}
        </DashboardCard>

        {/* Active Alerts */}
        <DashboardCard
          title="ACTIVE ALERTS"
          subtitle={`${topAlerts.length} unacknowledged`}
          glow={topAlerts.some(a => a.severity === 'critical') ? 'critical' : null}
          delay={0.4}
        >
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {topAlerts.length === 0 ? (
              <div className="text-center py-6">
                <Shield className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--tg-safe)' }} />
                <p className="text-sm" style={{ color: 'var(--tg-text-secondary)' }}>All clear</p>
              </div>
            ) : (
              topAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon, alert }: {
  label: string; value: string; icon: React.ReactNode; alert: boolean
}) {
  return (
    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--tg-hover-bg)' }}>
      <div className="flex items-center justify-center gap-1 mb-1"
           style={{ color: 'var(--tg-text-muted)' }}>
        {icon}
        <span className="text-[9px] font-mono-data">{label}</span>
      </div>
      <span
        className="text-sm font-mono-data font-medium"
        style={{ color: alert ? 'var(--tg-critical)' : 'var(--tg-text-primary)' }}
      >
        {value}
      </span>
    </div>
  )
}
