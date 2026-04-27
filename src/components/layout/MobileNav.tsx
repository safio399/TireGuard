import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CircleDot, AlertTriangle, BarChart3, Truck
} from 'lucide-react'
import { cn } from '../../lib/utils'

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Fleet',     icon: Truck,           to: '/fleet' },
  { label: 'Tires',     icon: CircleDot,       to: '/tire-status' },
  { label: 'Alerts',    icon: AlertTriangle,   to: '/alerts' },
  { label: 'Reports',   icon: BarChart3,       to: '/reports' },
]

export default function MobileNav() {
  return (
    <nav
      className="flex items-center justify-around py-2 border-t"
      style={{
        background: 'var(--tg-navbar-bg)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--tg-border)',
      }}
    >
      {items.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={() => cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors'
          )}
          style={({ isActive }) => ({
            color: isActive ? 'var(--tg-accent)' : 'var(--tg-text-muted)',
          })}
        >
          <Icon className="h-5 w-5" style={{ strokeWidth: 1.5 }} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
