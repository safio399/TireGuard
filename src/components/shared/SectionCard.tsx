import { cn } from '../../lib/utils'

interface Props {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function SectionCard({ title, badge, children, className }: Props) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900',
      'border border-gray-200 dark:border-gray-800',
      'rounded-xl shadow-sm p-4',
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  )
}
