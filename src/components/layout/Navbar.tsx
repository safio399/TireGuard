import { Search, Bell, Sun, Moon, Menu, Radio } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useTireData } from '../../context/DataContext'
import { motion, AnimatePresence } from 'framer-motion'
import darkLogo from '../../assets/dark.png'
import whiteLogo from '../../assets/white.png'

interface NavbarProps {
  onMenuToggle?: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggle } = useTheme()
  const { syncStatus, lastSync, data } = useTireData()

  const criticalCount = data.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
  const timeSinceSync = Math.round((Date.now() - lastSync.getTime()) / 1000)
  const logoSrc = theme === 'dark' ? darkLogo : whiteLogo

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center px-4 md:px-6 gap-3 z-30 border-b"
      style={{
        background: 'var(--tg-navbar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--tg-border)',
      }}
    >
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--tg-text-secondary)' }}
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img
          src={logoSrc}
          alt="TireGuard"
          height={34}
          style={{ height: 34, width: 'auto' }}
          className="shrink-0"
        />
        <span className="font-display text-sm font-semibold tracking-wider hidden sm:inline"
              style={{ color: 'var(--tg-text-primary)' }}>
          TIREGUARD
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 hidden md:block" style={{ background: 'var(--tg-border)' }} />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 w-64 h-8 px-3 rounded-lg"
           style={{
             background: 'var(--tg-hover-bg)',
             border: '1px solid var(--tg-border)',
           }}>
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--tg-text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--tg-text-muted)' }}>
          Search fleet, alerts...
        </span>
      </div>

      <div className="flex-1" />

      {/* Sync status */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
           style={{ background: 'var(--tg-hover-bg)' }}>
        <div className="relative flex items-center gap-1.5">
          <Radio className="h-3 w-3" style={{
            color: syncStatus === 'live' ? 'var(--tg-safe)' : 'var(--tg-warning)'
          }} />
          {syncStatus === 'live' && (
            <div className="absolute -left-0.5 -top-0.5 w-4 h-4 rounded-full animate-ping"
                 style={{ background: 'var(--tg-safe)', opacity: 0.2 }} />
          )}
        </div>
        <span className="font-mono-data text-[11px]" style={{ color: 'var(--tg-text-secondary)' }}>
          {syncStatus === 'live' ? 'Live' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
        </span>
        {syncStatus === 'syncing' && (
          <div className="w-12 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--tg-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--tg-accent)' }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
        <span className="font-mono-data text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>
          {timeSinceSync < 5 ? 'just now' : `${timeSinceSync}s ago`}
        </span>
      </div>

      {/* Alert badge */}
      <AnimatePresence>
        {criticalCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'rgba(var(--tg-critical-rgb), 0.1)',
              color: 'var(--tg-critical)',
              border: '1px solid rgba(var(--tg-critical-rgb), 0.2)',
            }}
          >
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--tg-critical)' }} />
              <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                   style={{ background: 'var(--tg-critical)', opacity: 0.4 }} />
            </div>
            {criticalCount} critical
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell */}
      <button
        className="relative p-2 rounded-lg transition-colors"
        style={{
          border: '1px solid var(--tg-border)',
          color: 'var(--tg-text-secondary)',
        }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {criticalCount > 0 && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full"
               style={{ background: 'var(--tg-critical)' }} />
        )}
      </button>

      {/* Theme toggle with rotation animation */}
      <motion.button
        className="p-2 rounded-lg transition-colors"
        style={{
          border: '1px solid var(--tg-border)',
          color: theme === 'dark' ? '#F0AB00' : 'var(--tg-info)',
        }}
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
        style={{
          background: 'rgba(var(--tg-accent-rgb), 0.12)',
          color: 'var(--tg-accent)',
        }}
      >
        FM
      </div>
    </header>
  )
}
