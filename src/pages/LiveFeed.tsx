import { useEffect, useMemo, useRef, useState } from 'react'
import { Radio } from 'lucide-react'
import { useTireData } from '../context/DataContext'
import DashboardCard from '../components/dashboard/DashboardCard'

interface PredictionDataset {
  machines: MachinePrediction[]
}

interface MachinePrediction {
  id: string
  udi: number
  type: 'L' | 'M' | 'H'
  airTemp: number
  processTemp: number
  rpm: number
  torque: number
  toolWear: number
  actualFailure: 0 | 1
  predictedProb: number
  predictedFailure: 0 | 1
  failureType: string | null
}

interface LogEntry {
  id: number
  timestamp: string
  machine: string
  profile: string
  failureType: string
  probability: string
  status: 'normal' | 'warning' | 'critical'
}

const INITIAL_ROWS = 18

export default function LiveFeed() {
  const { syncStatus } = useTireData()
  const [machines, setMachines] = useState<MachinePrediction[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const cursorRef = useRef(0)

  useEffect(() => {
    let isMounted = true

    const loadPredictions = async () => {
      try {
        const response = await fetch('/data/predictions.json')
        if (!response.ok) {
          throw new Error(`Failed to load predictions.json (${response.status})`)
        }

        const payload = await response.json() as PredictionDataset
        if (!isMounted) return

        setMachines(payload.machines)

        const initialLogs = payload.machines.slice(0, INITIAL_ROWS).map((machine, index) => {
          const offset = payload.machines.length - index
          return toLogEntry(machine, offset)
        })
        cursorRef.current = payload.machines.length > 0 ? INITIAL_ROWS % payload.machines.length : 0
        setLogs(initialLogs)
      } catch {
        if (!isMounted) return
        setLoadError('Unable to load prediction feed from public/data/predictions.json.')
      }
    }

    loadPredictions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (machines.length === 0) return

    const interval = window.setInterval(() => {
      const machine = machines[cursorRef.current]
      cursorRef.current = (cursorRef.current + 1) % machines.length

      setLogs((current) => [toLogEntry(machine), ...current].slice(0, 120))
    }, 1600)

    return () => window.clearInterval(interval)
  }, [machines])

  const summary = useMemo(() => {
    const critical = logs.filter((log) => log.status === 'critical').length
    const warning = logs.filter((log) => log.status === 'warning').length
    return { critical, warning, total: logs.length }
  }, [logs])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <h1 className="text-xl font-display font-semibold tracking-wider" style={{ color: 'var(--tg-text-primary)' }}>
            LIVE FEED
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="h-3.5 w-3.5" style={{ color: syncStatus === 'live' ? 'var(--tg-safe)' : 'var(--tg-warning)' }} />
              {syncStatus === 'live' && (
                <div className="absolute -inset-1 rounded-full animate-ping" style={{ background: 'var(--tg-safe)', opacity: 0.2 }} />
              )}
            </div>
            <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
              {syncStatus === 'live' ? 'Streaming prediction records...' : syncStatus === 'syncing' ? 'Reconnecting...' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FeedStat label="Records" value={String(summary.total)} tone="neutral" />
          <FeedStat label="Warning" value={String(summary.warning)} tone="warning" />
          <FeedStat label="Critical" value={String(summary.critical)} tone="critical" />
        </div>
      </div>

      <DashboardCard delay={0}>
        {loadError ? (
          <div className="rounded-lg border px-3 py-2 text-sm" style={{
            borderColor: 'rgba(var(--tg-critical-rgb), 0.35)',
            background: 'rgba(var(--tg-critical-rgb), 0.08)',
            color: 'var(--tg-critical)',
          }}>
            {loadError}
          </div>
        ) : (
          <div className="space-y-0.5 max-h-[600px] overflow-y-auto font-mono-data text-xs">
            <div
              className="sticky top-0 z-10 grid grid-cols-[92px_110px_1fr_120px_110px] gap-3 py-2"
              style={{
                background: 'var(--tg-card)',
                borderBottom: '1px solid var(--tg-border)',
              }}
            >
              <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>TIME</span>
              <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>MACHINE</span>
              <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>PROFILE</span>
              <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>FAULT</span>
              <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--tg-text-muted)' }}>RISK</span>
            </div>

            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[92px_110px_1fr_120px_110px] gap-3 rounded px-1 py-1.5 scan-hover transition-colors duration-150"
                style={{
                  borderLeft: `2px solid ${
                    log.status === 'critical'
                      ? 'var(--tg-critical)'
                      : log.status === 'warning'
                        ? 'var(--tg-warning)'
                        : 'transparent'
                  }`,
                }}
              >
                <span style={{ color: 'var(--tg-text-muted)' }}>{log.timestamp}</span>
                <span style={{ color: 'var(--tg-text-secondary)' }}>{log.machine}</span>
                <span style={{ color: 'var(--tg-text-primary)' }}>{log.profile}</span>
                <span style={{ color: log.status === 'normal' ? 'var(--tg-text-muted)' : log.status === 'warning' ? 'var(--tg-warning)' : 'var(--tg-critical)' }}>
                  {log.failureType}
                </span>
                <span className="font-medium" style={{
                  color: log.status === 'critical'
                    ? 'var(--tg-critical)'
                    : log.status === 'warning'
                      ? 'var(--tg-warning)'
                      : 'var(--tg-text-primary)',
                }}>
                  {log.probability}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

function FeedStat({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'warning' | 'critical' }) {
  const color = tone === 'critical'
    ? 'var(--tg-critical)'
    : tone === 'warning'
      ? 'var(--tg-warning)'
      : 'var(--tg-accent)'
  const borderColor = tone === 'critical'
    ? 'rgba(var(--tg-critical-rgb), 0.35)'
    : tone === 'warning'
      ? 'rgba(var(--tg-warning-rgb), 0.35)'
      : 'var(--tg-border)'
  const background = tone === 'critical'
    ? 'rgba(var(--tg-critical-rgb), 0.12)'
    : tone === 'warning'
      ? 'rgba(var(--tg-warning-rgb), 0.12)'
      : 'var(--tg-hover-bg)'

  return (
    <div className="rounded-full border px-3 py-1 text-[11px] font-mono-data" style={{
      borderColor,
      background,
      color,
    }}>
      {label}: {value}
    </div>
  )
}

function toLogEntry(machine: MachinePrediction, ageOffset = 0): LogEntry {
  const now = new Date(Date.now() - ageOffset * 1200)
  const probability = machine.predictedProb * 100
  const status: LogEntry['status'] =
    probability >= 60 || machine.predictedFailure === 1
      ? 'critical'
      : probability >= 30
        ? 'warning'
        : 'normal'

  return {
    id: Date.now() + ++ageOffset,
    timestamp: now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    machine: machine.id,
    profile: `${machine.type} | ${Math.round(machine.rpm)} rpm | ${machine.torque.toFixed(1)} Nm`,
    failureType: machine.failureType ?? 'HEALTHY',
    probability: `${probability.toFixed(1)}%`,
    status,
  }
}
