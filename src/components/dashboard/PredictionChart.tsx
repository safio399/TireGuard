import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import type { PredictionTimeline } from '../../types'

interface PredictionChartProps {
  timeline: PredictionTimeline
  className?: string
}

export default function PredictionChart({ timeline, className = '' }: PredictionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = timeline.predictions.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    value: p.value,
    lower: p.lower,
    upper: p.upper,
  }))

  const accentColor = isDark ? '#00F5FF' : '#0D9488'
  const criticalColor = isDark ? '#FF0055' : '#DC2626'
  const bandColor = isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(13, 148, 136, 0.08)'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)'
  const tickColor = isDark ? '#64748B' : '#94A3B8'

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fill: tickColor }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fill: tickColor }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
          />

          {/* Confidence interval band */}
          <Area
            dataKey="upper"
            stroke="none"
            fill={bandColor}
            fillOpacity={1}
          />
          <Area
            dataKey="lower"
            stroke="none"
            fill={isDark ? '#050505' : '#F8FAFC'}
            fillOpacity={1}
          />

          {/* Danger threshold */}
          <ReferenceLine
            y={3}
            stroke={criticalColor}
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: 'Replace',
              position: 'right',
              fontSize: 9,
              fontFamily: '"JetBrains Mono", monospace',
              fill: criticalColor,
            }}
          />

          {/* Main prediction line */}
          <Area
            dataKey="value"
            stroke={accentColor}
            strokeWidth={2}
            fill="url(#predGradient)"
            dot={false}
            activeDot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
          />

          <Tooltip
            contentStyle={{
              background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace',
              backdropFilter: 'blur(8px)',
              boxShadow: 'none',
            }}
            labelStyle={{ color: isDark ? '#E2E8F0' : '#0F172A', marginBottom: 4 }}
            itemStyle={{ color: accentColor, padding: 1 }}
            formatter={(val) => [`${Number(val).toFixed(1)} mm`, 'Tread Depth']}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-1">
        <LegendItem color={accentColor} label="Predicted" />
        <LegendItem
          color={bandColor}
          label={`±${((1 - timeline.confidence) * 100).toFixed(0)}% CI`}
          dashed
        />
        <LegendItem color={criticalColor} label="Replace Threshold" dashed />
      </div>
    </div>
  )
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>
      <span
        className="w-3 h-0.5 rounded inline-block"
        style={{
          background: color,
          borderTop: dashed ? `1px dashed ${color}` : undefined,
        }}
      />
      {label}
    </span>
  )
}
