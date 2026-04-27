import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Activity, Truck,
  TrendingUp, AlertTriangle,
  BarChart3, CircleDot, X, Settings
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navGroups = [
  {
    label: 'Monitor',
    items: [
      { label: 'Dashboard',    icon: LayoutDashboard, to: '/' },
      { label: 'Fleet Status', icon: Truck,           to: '/fleet' },
      { label: 'Live Feed',    icon: Activity,        to: '/live' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { label: 'Tire Health',   icon: CircleDot,      to: '/tire-status' },
      { label: 'Predictions',   icon: TrendingUp,     to: '/predictions' },
      { label: 'Alerts',        icon: AlertTriangle,  to: '/alerts' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics',     icon: BarChart3,      to: '/reports' },
      { label: 'Settings',      icon: Settings,       to: '/settings' },
    ],
  },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside
      className="w-56 shrink-0 flex flex-col overflow-y-auto h-full"
      style={{
        background: 'var(--tg-sidebar-bg)',
        borderRight: '1px solid var(--tg-border)',
      }}
    >
      {onClose && (
        <div className="flex justify-end p-3 lg:hidden">
          <button onClick={onClose} style={{ color: 'var(--tg-text-muted)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {navGroups.map(group => (
        <div key={group.label}>
          <p
            className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase px-4 pt-5 pb-1.5"
            style={{ color: 'var(--tg-text-muted)' }}
          >
            {group.label}
          </p>
          {group.items.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => cn(
                'group flex items-center gap-2.5 px-3 py-2 mx-2 my-0.5',
                'rounded-lg text-sm font-body transition-all duration-200',
                'scan-hover relative',
                isActive
                  ? 'font-medium'
                  : 'hover:translate-x-0.5'
              )}
              style={({ isActive }) => ({
                background: isActive ? 'var(--tg-active-bg)' : 'transparent',
                color: isActive ? 'var(--tg-accent)' : 'var(--tg-text-secondary)',
                borderLeft: isActive ? '2px solid var(--tg-accent)' : '2px solid transparent',
              })}
            >
              <Icon
                className="h-4 w-4 shrink-0 transition-all duration-200"
                style={{ strokeWidth: 1.5 }}
              />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      {/* Bottom fleet info */}
      <div className="mt-auto p-3" style={{ borderTop: '1px solid var(--tg-border)' }}>
        <div className="rounded-xl p-3" style={{ background: 'var(--tg-hover-bg)' }}>
          <p className="text-[9px] font-display tracking-[0.2em] uppercase mb-1"
             style={{ color: 'var(--tg-text-muted)' }}>
            Active Fleet
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--tg-text-primary)' }}>
            North Region · Zone A
          </p>
          <p className="text-[10px] mt-0.5 font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
            12 vehicles · 48 tires
          </p>
        </div>
      </div>
    </aside>
  )
}
