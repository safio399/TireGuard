import { useState, useEffect, useRef } from 'react'
import { useTireData } from '../context/DataContext'
import DashboardCard from '../components/dashboard/DashboardCard'
import { Radio } from 'lucide-react'

interface LogEntry {
  id: number
  timestamp: string
  vehicle: string
  tire: string
  metric: string
  value: string
  status: 'normal' | 'warning' | 'critical'
}

export default function LiveFeed() {
  const { data, syncStatus } = useTireData()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const logIdRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate live feed entries
  useEffect(() => {
    const generateEntry = (): LogEntry => {
      const v = data.fleet[Math.floor(Math.random() * data.fleet.length)]
      const t = v.tires[Math.floor(Math.random() * v.tires.length)]
      const metrics = [
        { metric: 'pressure', value: `${t.sensor.pressure.toFixed(1)} PSI`, status: t.sensor.pressure < 27 ? 'critical' as const : t.sensor.pressure < 30 ? 'warning' as const : 'normal' as const },
        { metric: 'temperature', value: `${t.sensor.temperature.toFixed(0)}°F`, status: t.sensor.temperature > 85 ? 'critical' as const : t.sensor.temperature > 78 ? 'warning' as const : 'normal' as const },
        { metric: 'tread_depth', value: `${t.sensor.treadDepth.toFixed(1)} mm`, status: t.sensor.treadDepth < 3 ? 'critical' as const : t.sensor.treadDepth < 5 ? 'warning' as const : 'normal' as const },
      ]
      const m = metrics[Math.floor(Math.random() * metrics.length)]
      return {
        id: ++logIdRef.current,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1 }),
        vehicle: v.name,
        tire: t.label,
        ...m,
      }
    }

    // Initial batch
    const initial: LogEntry[] = []
    for (let i = 0; i < 15; i++) initial.push(generateEntry())
    setLogs(initial)

    // Add new entries periodically
    const interval = setInterval(() => {
      setLogs(prev => [generateEntry(), ...prev].slice(0, 100))
    }, 1500 + Math.random() * 2000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          LIVE FEED
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-3.5 w-3.5" style={{
              color: syncStatus === 'live' ? 'var(--tg-safe)' : 'var(--tg-warning)'
            }} />
            {syncStatus === 'live' && (
              <div className="absolute -inset-1 rounded-full animate-ping"
                   style={{ background: 'var(--tg-safe)', opacity: 0.2 }} />
            )}
          </div>
          <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
            {syncStatus === 'live' ? 'Streaming sensor data...' : syncStatus === 'syncing' ? 'Reconnecting...' : 'Offline'}
          </span>
        </div>
      </div>

      <DashboardCard delay={0}>
        <div ref={containerRef} className="space-y-0.5 max-h-[600px] overflow-y-auto font-mono-data text-xs">
          {/* Header row */}
          <div className="flex gap-3 py-2 sticky top-0 z-10"
               style={{
                 background: 'var(--tg-card)',
                 borderBottom: '1px solid var(--tg-border)',
               }}>
            <span className="w-20 text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>TIME</span>
            <span className="w-32 text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>VEHICLE</span>
            <span className="w-24 text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>TIRE</span>
            <span className="w-24 text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>METRIC</span>
            <span className="flex-1 text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>VALUE</span>
          </div>

          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-3 py-1.5 px-1 rounded scan-hover transition-colors duration-150"
              style={{
                borderLeft: `2px solid ${
                  log.status === 'critical' ? 'var(--tg-critical)' :
                  log.status === 'warning' ? 'var(--tg-warning)' :
                  'transparent'
                }`,
              }}
            >
              <span className="w-20 tabular-nums" style={{ color: 'var(--tg-text-muted)' }}>
                {log.timestamp}
              </span>
              <span className="w-32" style={{ color: 'var(--tg-text-secondary)' }}>
                {log.vehicle}
              </span>
              <span className="w-24" style={{ color: 'var(--tg-text-secondary)' }}>
                {log.tire}
              </span>
              <span className="w-24" style={{ color: 'var(--tg-text-muted)' }}>
                {log.metric}
              </span>
              <span className="flex-1 font-medium" style={{
                color: log.status === 'critical' ? 'var(--tg-critical)' :
                       log.status === 'warning' ? 'var(--tg-warning)' :
                       'var(--tg-text-primary)',
              }}>
                {log.value}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}
