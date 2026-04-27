import { useMemo } from 'react'
import { useTireData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import DashboardCard from '../components/dashboard/DashboardCard'
import { getFleetSummary } from '../data/mockTireData'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Cell, PieChart, Pie, Line, Area, AreaChart
} from 'recharts'

export default function Reports() {
  const { data } = useTireData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const summary = useMemo(() => getFleetSummary(data), [data])

  const accentColor = isDark ? '#00F5FF' : '#0D9488'
  const criticalColor = isDark ? '#FF0055' : '#DC2626'
  const warningColor = isDark ? '#F0AB00' : '#D97706'
  const safeColor = isDark ? '#00F5FF' : '#059669'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)'
  const tickColor = isDark ? '#64748B' : '#94A3B8'

  // Status pie data
  const statusData = [
    { name: 'Safe', value: summary.safe, color: safeColor },
    { name: 'Warning', value: summary.warn + summary.elevated, color: warningColor },
    { name: 'Critical', value: summary.critical, color: criticalColor },
  ]

  // Monthly trend (mock)
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    replacements: Math.floor(Math.random() * 8) + 2,
    alerts: Math.floor(Math.random() * 15) + 5,
  }))

  // Pressure distribution
  const allTires = data.fleet.flatMap(v => v.tires)
  const pressureBuckets = [
    { range: '<25', count: allTires.filter(t => t.sensor.pressure < 25).length },
    { range: '25-28', count: allTires.filter(t => t.sensor.pressure >= 25 && t.sensor.pressure < 28).length },
    { range: '28-31', count: allTires.filter(t => t.sensor.pressure >= 28 && t.sensor.pressure < 31).length },
    { range: '31-34', count: allTires.filter(t => t.sensor.pressure >= 31 && t.sensor.pressure < 34).length },
    { range: '34+', count: allTires.filter(t => t.sensor.pressure >= 34).length },
  ]

  const tooltipStyle = {
    background: isDark ? 'rgba(10,10,10,0.95)' : '#fff',
    border: `1px solid var(--tg-border)`,
    borderRadius: 8, fontSize: 11,
    fontFamily: '"JetBrains Mono"',
    boxShadow: 'none',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          ANALYTICS
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          Fleet performance reports
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Health Distribution */}
        <DashboardCard title="FLEET HEALTH DISTRIBUTION" delay={0}>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-secondary)' }}>
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Pressure distribution */}
        <DashboardCard title="PRESSURE DISTRIBUTION" delay={0.05}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pressureBuckets} barSize={28}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range"
                     tick={{ fontSize: 9, fontFamily: '"JetBrains Mono"', fill: tickColor }}
                     axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fontFamily: '"JetBrains Mono"', fill: tickColor }}
                     axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pressureBuckets.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.range === '<25' ? criticalColor :
                    entry.range === '25-28' ? warningColor : accentColor
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] font-mono-data text-center mt-1"
             style={{ color: 'var(--tg-text-muted)' }}>
            PSI range distribution across {allTires.length} tires
          </p>
        </DashboardCard>

        {/* Replacement trend */}
        <DashboardCard title="MONTHLY REPLACEMENT TREND" className="lg:col-span-2" delay={0.1}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="replacementGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month"
                     tick={{ fontSize: 9, fontFamily: '"JetBrains Mono"', fill: tickColor }}
                     axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fontFamily: '"JetBrains Mono"', fill: tickColor }}
                     axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="replacements" stroke={accentColor} fill="url(#replacementGrad)" strokeWidth={2} />
              <Line dataKey="alerts" stroke={warningColor} strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: accentColor }} />
              Replacements
            </span>
            <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: warningColor, borderTop: `1px dashed ${warningColor}` }} />
              Alerts
            </span>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
