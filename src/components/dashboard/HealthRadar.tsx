import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import type { Tire } from '../../types'

interface HealthRadarProps {
  tire: Tire
  className?: string
}

export default function HealthRadar({ tire, className = '' }: HealthRadarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const data = [
    {
      axis: 'Pressure',
      value: normalize(tire.sensor.pressure, 20, 40),
      fullMark: 100,
    },
    {
      axis: 'Temperature',
      value: normalize(100 - tire.sensor.temperature, 10, 40), // inverted: lower is better
      fullMark: 100,
    },
    {
      axis: 'Tread',
      value: normalize(tire.sensor.treadDepth, 0, 10),
      fullMark: 100,
    },
    {
      axis: 'Age',
      value: normalize(48 - tire.sensor.age, 0, 48), // inverted: newer is better
      fullMark: 100,
    },
    {
      axis: 'Alignment',
      value: tire.sensor.alignment,
      fullMark: 100,
    },
  ]

  const accentColor = isDark ? '#00F5FF' : '#0D9488'
  const fillColor = isDark ? 'rgba(0, 245, 255, 0.15)' : 'rgba(13, 148, 136, 0.15)'

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fontSize: 10,
              fontFamily: '"JetBrains Mono", monospace',
              fill: isDark ? '#94A3B8' : '#475569',
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Health"
            dataKey="value"
            stroke={accentColor}
            fill={fillColor}
            strokeWidth={1.5}
            dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}
