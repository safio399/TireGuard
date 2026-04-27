import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Bell, Shield, Database } from 'lucide-react'
import DashboardCard from '../components/dashboard/DashboardCard'

export default function Settings() {
  const { theme, toggle } = useTheme()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <h1 className="text-xl font-display font-semibold tracking-wider"
            style={{ color: 'var(--tg-text-primary)' }}>
          SETTINGS
        </h1>
        <span className="text-xs font-mono-data" style={{ color: 'var(--tg-text-muted)' }}>
          Platform configuration
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
        {/* Theme */}
        <DashboardCard title="APPEARANCE" delay={0}>
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--tg-text-secondary)' }}>
              Choose your preferred display mode. The dark theme is optimized for control rooms;
              the light theme for daylight workshops.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => theme !== 'dark' && toggle()}
                className="flex-1 p-3 rounded-lg text-center transition-all duration-200"
                style={{
                  background: theme === 'dark' ? 'var(--tg-active-bg)' : 'var(--tg-hover-bg)',
                  border: `1px solid ${theme === 'dark' ? 'var(--tg-accent)' : 'var(--tg-border)'}`,
                  color: theme === 'dark' ? 'var(--tg-accent)' : 'var(--tg-text-secondary)',
                }}
              >
                <Moon className="h-5 w-5 mx-auto mb-1.5" />
                <p className="text-xs font-medium">Dark</p>
                <p className="text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>Control room</p>
              </button>
              <button
                onClick={() => theme !== 'light' && toggle()}
                className="flex-1 p-3 rounded-lg text-center transition-all duration-200"
                style={{
                  background: theme === 'light' ? 'var(--tg-active-bg)' : 'var(--tg-hover-bg)',
                  border: `1px solid ${theme === 'light' ? 'var(--tg-accent)' : 'var(--tg-border)'}`,
                  color: theme === 'light' ? 'var(--tg-accent)' : 'var(--tg-text-secondary)',
                }}
              >
                <Sun className="h-5 w-5 mx-auto mb-1.5" />
                <p className="text-xs font-medium">Light</p>
                <p className="text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>Workshop</p>
              </button>
            </div>
          </div>
        </DashboardCard>

        {/* Notifications */}
        <DashboardCard title="NOTIFICATIONS" delay={0.05}>
          <div className="space-y-3">
            <SettingRow icon={<Bell className="h-4 w-4" />} label="Push alerts" description="Receive critical tire alerts" defaultOn />
            <SettingRow icon={<Shield className="h-4 w-4" />} label="Safety warnings" description="Immediate blowout risk alerts" defaultOn />
            <SettingRow icon={<Database className="h-4 w-4" />} label="Data sync" description="Background sensor sync notifications" />
          </div>
        </DashboardCard>

        {/* System info */}
        <DashboardCard title="SYSTEM INFO" className="lg:col-span-2" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Version', value: 'v3.0.1' },
              { label: 'Model', value: 'RF-Ensemble v2' },
              { label: 'Fleet Zone', value: 'North A' },
              { label: 'Sensor Protocol', value: 'TPMS-IoT v2.3' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--tg-hover-bg)' }}>
                <p className="text-[9px] font-display tracking-wider uppercase"
                   style={{ color: 'var(--tg-text-muted)' }}>{item.label}</p>
                <p className="text-sm font-mono-data font-medium mt-1"
                   style={{ color: 'var(--tg-text-primary)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

function SettingRow({ icon, label, description, defaultOn }: {
  icon: React.ReactNode; label: string; description: string; defaultOn?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg scan-hover"
         style={{ borderBottom: '1px solid var(--tg-border)' }}>
      <div className="flex items-center gap-3">
        <div style={{ color: 'var(--tg-text-muted)' }}>{icon}</div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--tg-text-primary)' }}>{label}</p>
          <p className="text-[10px]" style={{ color: 'var(--tg-text-muted)' }}>{description}</p>
        </div>
      </div>
      <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${defaultOn ? '' : ''}`}
           style={{ background: defaultOn ? 'var(--tg-accent)' : 'var(--tg-border-strong)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
             style={{ left: defaultOn ? '18px' : '2px' }} />
      </div>
    </div>
  )
}
