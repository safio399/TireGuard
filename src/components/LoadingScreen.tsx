import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing system...')
  const [wireframeProgress, setWireframeProgress] = useState(0)

  useEffect(() => {
    const steps = [
      { pct: 15, label: 'Connecting to sensor network...' },
      { pct: 30, label: 'Loading fleet telemetry...' },
      { pct: 50, label: 'Calibrating tire models...' },
      { pct: 70, label: 'Running predictive analysis...' },
      { pct: 85, label: 'Computing risk scores...' },
      { pct: 100, label: 'System ready.' },
    ]
    let i = 0
    const timer = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].pct)
        setStatus(steps[i].label)
        setWireframeProgress(steps[i].pct / 100)
        i++
      } else {
        clearInterval(timer)
      }
    }, 350)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 z-50"
      style={{ background: '#050505' }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: 'rgba(0, 245, 255, 0.15)' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Subtle horizontal scan lines */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${(i / 40) * 100}%`,
              background: 'rgba(0, 245, 255, 0.03)',
            }}
          />
        ))}
      </div>

      {/* Wireframe tire build-up animation */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <defs>
            <linearGradient id="loadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="50%" stopColor="#00F5FF" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <clipPath id="revealClip">
              <rect x="0" y={160 - 160 * wireframeProgress} width="160" height={160 * wireframeProgress} />
            </clipPath>
          </defs>

          {/* Background tire outline (dim) */}
          <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="80" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Revealed tire wireframe (builds bottom to top) */}
          <g clipPath="url(#revealClip)">
            {/* Outer tire */}
            <circle cx="80" cy="80" r="65" fill="none" stroke="url(#loadGrad)" strokeWidth="2.5"
                    strokeDasharray="6 3" />
            <circle cx="80" cy="80" r="62" fill="none" stroke="url(#loadGrad)" strokeWidth="0.5"
                    opacity="0.4" />
            {/* Inner structure */}
            <circle cx="80" cy="80" r="50" fill="none" stroke="#00F5FF" strokeWidth="1.5" opacity="0.6" />
            {/* Rim */}
            <circle cx="80" cy="80" r="30" fill="none" stroke="#00F5FF" strokeWidth="1.5" opacity="0.8" />
            {/* Spokes */}
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const x2 = 80 + Math.cos(rad) * 28
              const y2 = 80 + Math.sin(rad) * 28
              return (
                <line key={angle} x1="80" y1="80" x2={x2} y2={y2}
                      stroke="#00F5FF" strokeWidth="1" opacity="0.6" />
              )
            })}
            {/* Hub */}
            <circle cx="80" cy="80" r="12" fill="none" stroke="#00F5FF" strokeWidth="1.5" />
          </g>

          {/* Scan line at build edge */}
          <line
            x1="0" y1={160 - 160 * wireframeProgress}
            x2="160" y2={160 - 160 * wireframeProgress}
            stroke="#00F5FF" strokeWidth="1" opacity={wireframeProgress < 1 ? 0.6 : 0}
          />
        </svg>
      </div>

      {/* Logo text */}
      <div className="text-center">
        <h1 className="font-display text-2xl tracking-[0.2em] font-bold"
            style={{ color: '#00F5FF' }}>
          TIREGUARD
        </h1>
        <p className="font-display text-xs tracking-[0.3em] mt-1"
           style={{ color: 'rgba(0, 245, 255, 0.4)' }}>
          PREDICTIVE MAINTENANCE
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-72 flex flex-col gap-2">
        <div className="h-px w-full rounded-full overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00F5FF, #8b5cf6)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono-data text-[11px] tracking-wider"
                style={{ color: '#00F5FF' }}>
            {status}
          </span>
          <span className="font-mono-data text-[11px]"
                style={{ color: 'rgba(0, 245, 255, 0.4)' }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* System info */}
      <span className="font-mono-data text-[10px] tracking-wider"
            style={{ color: 'rgba(255,255,255,0.15)' }}>
        TIREGUARD SYS v3.0 · FLEET MONITOR · ZONE A
      </span>
    </div>
  )
}