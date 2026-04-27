import { cn } from '../../lib/utils'

interface Props {
  label: string
  value: string
  sub: string
  subColor: 'red' | 'green' | 'gray'
  icon: React.ReactNode
  accentLeft?: boolean
}

export default function KpiCard({ label, value, sub, subColor, icon, accentLeft }: Props) {
  const subColors = {
    red:   'text-red-600 dark:text-red-400',
    green: 'text-green-600 dark:text-green-400',
    gray:  'text-gray-400',
  }
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 shadow-sm p-4',
      'border border-gray-200 dark:border-gray-800',
      accentLeft
        ? 'border-l-4 border-l-red-500 rounded-r-xl rounded-l-none'
        : 'rounded-xl'
    )}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
        {icon}
        {label}
      </div>
      <div className={cn('text-3xl font-bold tabular-nums', accentLeft ? 'text-red-500' : 'text-gray-900 dark:text-gray-100')}>
        {value}
      </div>
      <div className={cn('flex items-center gap-1.5 text-xs mt-1.5', subColors[subColor])}>
        <div className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-red-500': subColor === 'red',
          'bg-green-500': subColor === 'green',
          'bg-gray-400': subColor === 'gray',
        })} />
        {sub}
      </div>
    </div>
  )
}
