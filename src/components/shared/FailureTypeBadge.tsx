import { cn, getFailureTypeColor } from '../../lib/utils'

export default function FailureTypeBadge({ type }: { type: string | null }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getFailureTypeColor(type))}>
      {type ?? '—'}
    </span>
  )
}
