import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTireData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import TireScene from '../components/three/TireScene'
import HealthRadar from '../components/dashboard/HealthRadar'
import type { FleetVehicle, TireRiskLevel } from '../types'
import DashboardCard from '../components/dashboard/DashboardCard'

const riskOrder: Record<TireRiskLevel, number> = { safe: 0, warn: 1, elevated: 2, critical: 3 }

export default function TireStatus() {
  const { data } = useTireData()
  const { theme } = useTheme()
  const [selectedVehicle, setSelectedVehicle] = useState<string>(data.fleet[0]?.id)
  const [selectedTirePos, setSelectedTirePos] = useState<string>('FL')

  const vehicle = useMemo(
    () => data.fleet.find(v => v.id === selectedVehicle) || data.fleet[0],
    [data, selectedVehicle]
  )
  const tire = useMemo(
    () => vehicle?.tires.find(t => t.position === selectedTirePos) || vehicle?.tires[0],
    [vehicle, selectedTirePos]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          TIRE HEALTH
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          Real-time tire condition monitoring
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vehicle & Tire Selector */}
        <div className="lg:col-span-3 space-y-4">
          {/* Vehicle selector */}
          <DashboardCard title="SELECT VEHICLE" delay={0}>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {data.fleet.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVehicle(v.id); setSelectedTirePos('FL') }}
                  className="w-full text-left p-2.5 rounded-lg transition-all duration-200 scan-hover"
                  style={{
                    background: selectedVehicle === v.id ? 'var(--tg-active-bg)' : 'transparent',
                    borderLeft: selectedVehicle === v.id ? '2px solid var(--tg-accent)' : '2px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--tg-text-primary)' }}>
                        {v.name}
                      </p>
                      <p className="text-[10px] font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
                        {v.plate} · {v.mileage.toLocaleString()} km
                      </p>
                    </div>
                    <VehicleStatusDot vehicle={v} />
                  </div>
                </button>
              ))}
            </div>
          </DashboardCard>

          {/* Tire position selector (4 quadrants) */}
          <DashboardCard title="TIRE POSITION" delay={0.05}>
            <div className="grid grid-cols-2 gap-2">
              {vehicle?.tires.map(t => (
                <button
                  key={t.position}
                  onClick={() => setSelectedTirePos(t.position)}
                  className="p-3 rounded-lg text-center transition-all duration-200"
                  style={{
                    background: selectedTirePos === t.position
                      ? 'var(--tg-active-bg)'
                      : 'var(--tg-hover-bg)',
                    border: `1px solid ${selectedTirePos === t.position
                      ? 'var(--tg-accent)'
                      : 'var(--tg-border)'}`,
                  }}
                >
                  <p className="text-[10px] font-display font-semibold tracking-wider"
                     style={{ color: 'var(--tg-text-muted)' }}>
                    {t.label.toUpperCase()}
                  </p>
                  <p className="text-lg font-mono-data font-medium mt-1"
                     style={{ color: getLevelColor(t.level) }}>
                    {t.sensor.pressure.toFixed(0)}
                  </p>
                  <p className="text-[9px] font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
                    PSI
                  </p>
                  <StatusBadge level={t.level} />
                </button>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* 3D Tire Visualization */}
        <div className="lg:col-span-5">
          <DashboardCard
            title="VISUAL DIAGNOSTIC"
            subtitle={tire ? `${tire.id} · ${tire.brand} · Last: ${new Date(tire.lastService).toLocaleDateString()}` : ''}
            techBorder
            delay={0.1}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tire?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[350px] md:h-[420px] rounded-xl overflow-hidden"
                style={{
                  background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(248,250,252,0.8)',
                }}
              >
                <TireScene tire={tire} />
              </motion.div>
            </AnimatePresence>
          </DashboardCard>
        </div>

        {/* Tire Details & Health Radar */}
        <div className="lg:col-span-4 space-y-4">
          <DashboardCard title="SENSOR DATA" delay={0.15}>
            {tire && (
              <div className="space-y-3">
                <SensorRow label="Pressure" value={`${tire.sensor.pressure.toFixed(1)} PSI`}
                           alert={tire.sensor.pressure < 27} />
                <SensorRow label="Temperature" value={`${tire.sensor.temperature.toFixed(0)}°F`}
                           alert={tire.sensor.temperature > 82} />
                <SensorRow label="Tread Depth" value={`${tire.sensor.treadDepth.toFixed(1)} mm`}
                           alert={tire.sensor.treadDepth < 4} />
                <SensorRow label="Alignment" value={`${tire.sensor.alignment}%`}
                           alert={tire.sensor.alignment < 70} />
                <SensorRow label="Age" value={`${tire.sensor.age} months`} />
                <SensorRow label="Latency" value={`${tire.sensor.latency} ms`} />

                <div className="pt-2" style={{ borderTop: '1px solid var(--tg-border)' }}>
                  <p className="text-[9px] font-display tracking-[0.15em] uppercase mb-1.5"
                     style={{ color: 'var(--tg-text-muted)' }}>
                    PREDICTED REPLACEMENT
                  </p>
                  <p className="text-sm font-mono-data font-medium"
                     style={{ color: 'var(--tg-text-primary)' }}>
                    {new Date(tire.predictedReplacement).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <p className="text-[10px] font-mono-data mt-0.5"
                     style={{ color: 'var(--tg-text-muted)' }}>
                    Confidence: {(tire.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            )}
          </DashboardCard>

          <DashboardCard title="HEALTH RADAR" delay={0.2}>
            {tire && <HealthRadar tire={tire} />}
          </DashboardCard>

          {/* Fault zones */}
          {tire && tire.faultZones.length > 0 && (
            <DashboardCard title="FAULT ZONES" glow="critical" delay={0.25}>
              <div className="space-y-2">
                {tire.faultZones.map((fault, i) => (
                  <div key={i} className="p-2.5 rounded-lg" style={{ background: 'var(--tg-hover-bg)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-display font-semibold tracking-wider uppercase"
                            style={{ color: fault.severity > 0.6 ? 'var(--tg-critical)' : 'var(--tg-warning)' }}>
                        {fault.type}
                      </span>
                      <span className="text-[10px] font-mono-data"
                            style={{ color: 'var(--tg-text-muted)' }}>
                        severity: {(fault.severity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--tg-text-secondary)' }}>
                      {fault.description}
                    </p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  )
}

function SensorRow({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 scan-hover px-1 rounded"
         style={{ borderBottom: '1px solid var(--tg-border)' }}>
      <span className="text-xs" style={{ color: 'var(--tg-text-secondary)' }}>{label}</span>
      <span className="text-xs font-mono-data font-medium"
            style={{ color: alert ? 'var(--tg-critical)' : 'var(--tg-text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ level }: { level: TireRiskLevel }) {
  return (
    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-display font-semibold tracking-wider uppercase"
          style={{
            background: `${getLevelColor(level)}22`,
            color: getLevelColor(level),
          }}>
      {level}
    </span>
  )
}

function VehicleStatusDot({ vehicle }: { vehicle: FleetVehicle }) {
  const worst = vehicle.tires.reduce((w, t) =>
    riskOrder[t.level] > riskOrder[w.level] ? t : w
  )
  return (
    <div className="w-2 h-2 rounded-full" style={{ background: getLevelColor(worst.level) }} />
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
