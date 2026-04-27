import { cn, getRiskLevel, getRiskColor } from '../../lib/utils'

export default function RiskBadge({ prob }: { prob: number }) {
  const level = getRiskLevel(prob)
  const label = `${Math.round(prob * 100)}% risk`
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getRiskColor(level))}>
      {label}
    </span>
  )
}
