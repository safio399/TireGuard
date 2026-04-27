import React from 'react';

type RiskLevel = 'safe' | 'warn' | 'elevated' | 'critical';

interface TireFigureProps {
  level: RiskLevel;
  pressure: number; // tire pressure in PSI
  theme?: 'light' | 'dark';
}

const riskColor: Record<RiskLevel, string> = {
  safe: '#00ffa6',
  warn: '#eab308',
  elevated: '#f97316',
  critical: '#ef4444',
};

const statusLabel: Record<RiskLevel, string> = {
  safe: 'Optimal',
  warn: 'Monitor',
  elevated: 'Warning',
  critical: 'Critical',
};

// Visual damage features based on risk level
interface TireFeatures {
  cracks: Array<{ d: string }>;     // crack paths on sidewall
  leaks: boolean;                   // air leak bubbles
  puncture: boolean;                // visible puncture mark
  bulge: boolean;                   // sidewall bulge indicator
  warningIcon: boolean;             // exclamation mark
}

const getTireFeatures = (level: RiskLevel): TireFeatures => {
  switch (level) {
    case 'safe':
      return {
        cracks: [],
        leaks: false,
        puncture: false,
        bulge: false,
        warningIcon: false,
      };
    case 'warn':
      return {
        cracks: [{ d: 'M70 70 L73 73 L71 76' }],
        leaks: false,
        puncture: false,
        bulge: false,
        warningIcon: false,
      };
    case 'elevated':
      return {
        cracks: [
          { d: 'M70 70 L73 73 L71 76' },
          { d: 'M92 64 L94 67 L91 70' },
        ],
        leaks: true,
        puncture: false,
        bulge: false,
        warningIcon: false,
      };
    case 'critical':
      return {
        cracks: [
          { d: 'M70 70 L73 73 L71 76' },
          { d: 'M92 64 L94 67 L91 70' },
          { d: 'M78 48 L81 50 L79 53' },
        ],
        leaks: true,
        puncture: true,
        bulge: true,
        warningIcon: true,
      };
  }
};

const TireFigure: React.FC<TireFigureProps> = ({ level, pressure, theme = 'dark' }) => {
  const color = riskColor[level];
  const id = `tire-${level}`;
  const features = getTireFeatures(level);
  
  // Determine pulse speed based on pressure anomaly (or critical level)
  const isPressureCritical = pressure < 25 || pressure > 45;
  const pulseSpeed = level === 'critical' || isPressureCritical ? '0.6s' : '1.2s';

  // Theme-based adjustments
  const scanLineColor = theme === 'dark' ? '#00f0ff' : '#0891b2';
  const holoStart = theme === 'dark' ? '#00f0ff' : '#06b6d4';
  const holoEnd = theme === 'dark' ? '#8b5cf6' : '#6366f1';
  const bgOpacity = theme === 'dark' ? '0.9' : '0.95';
  const rimFill = theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)';
  const tireGradInner = theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.9)';
  const hubFill = theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)';

  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      <style>{`
        @keyframes hologram-flicker {
          0%,100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        @keyframes scan-move {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(120%); }
        }

        @keyframes pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes leak-bubble {
          0% { transform: translateY(0) scale(0.8); opacity: 0.8; }
          100% { transform: translateY(-12px) scale(1.2); opacity: 0; }
        }

        @keyframes bulge-shake {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(1px,0); }
          75% { transform: translate(-1px,0); }
        }

        .hologram {
          animation: hologram-flicker 2s infinite ease-in-out;
        }

        .scan {
          animation: scan-move 3s linear infinite;
        }

        .pulse {
          animation: pulse ${pulseSpeed} infinite ease-in-out;
          transform-origin: center;
        }

        .critical-glitch {
          animation: hologram-flicker 0.8s infinite;
        }

        .leak-bubble {
          animation: leak-bubble 1.2s infinite ease-out;
        }

        .bulge-animation {
          animation: bulge-shake 0.3s infinite;
          transform-origin: 80px 85px;
        }
      `}</style>

      <svg
        className={`hologram ${level === 'critical' ? 'critical-glitch' : ''}`}
        width="160"
        height="200"
        viewBox="0 0 160 200"
      >
        <defs>
          <linearGradient id={`holo-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={holoStart} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={holoEnd} />
          </linearGradient>

          <radialGradient id={`tire-grad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor={tireGradInner} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </radialGradient>

          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Scan lines background */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={i}
            x1={i * 8} y1="0"
            x2={i * 8} y2="200"
            stroke={scanLineColor}
            strokeWidth="0.3"
            opacity={theme === 'dark' ? '0.12' : '0.08'}
          />
        ))}

        {/* Moving scan beam */}
        <rect
          className="scan"
          x="0" y="0" width="160" height="30"
          fill={`url(#holo-${id})`}
          opacity="0.07"
        />

        {/* Main tire group */}
        <g filter={`url(#glow-${id})`}>
          {/* Outer tire body (rubber) */}
          <circle
            cx="80" cy="85" r="54"
            fill="none"
            stroke={`url(#holo-${id})`}
            strokeWidth="2.5"
            opacity="0.9"
          />
          
          {/* Tread pattern (dashed outer ring) */}
          <circle
            cx="80" cy="85" r="54"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray="5 4"
            opacity="0.8"
          />

          {/* Inner tire ring */}
          <circle
            cx="80" cy="85" r="46"
            fill="none"
            stroke={`url(#holo-${id})`}
            strokeWidth="1.2"
            opacity="0.6"
          />

          {/* Rim outer edge */}
          <circle
            cx="80" cy="85" r="32"
            fill={rimFill}
            stroke={color}
            strokeWidth="1.5"
            opacity={bgOpacity}
          />

          {/* Rim inner area */}
          <circle
            cx="80" cy="85" r="24"
            fill={`url(#tire-grad-${id})`}
            stroke={color}
            strokeWidth="0.8"
            opacity="0.7"
          />

          {/* Spokes (6 spokes) */}
          {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 80 + Math.cos(rad) * 28;
            const y2 = 85 + Math.sin(rad) * 28;
            return (
              <line
                key={idx}
                x1="80" y1="85"
                x2={x2} y2={y2}
                stroke={color}
                strokeWidth="1.2"
                opacity="0.7"
              />
            );
          })}

          {/* Central hub cap */}
          <circle
            cx="80" cy="85" r="8"
            fill={hubFill}
            stroke={color}
            strokeWidth="1"
          />

          {/* Valve stem */}
          <rect
            x="128" y="82" width="6" height="3"
            rx="1" fill={color} opacity="0.9"
          />
          <circle cx="134" cy="83.5" r="1.5" fill={color} opacity="0.8" />

          {/* Pressure text inside rim (pulsing if critical) */}
          <g className={level === 'critical' ? 'pulse' : ''}>
            <text
              x="80" y="88"
              textAnchor="middle"
              fill={color}
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              opacity="0.95"
            >
              {pressure} PSI
            </text>
          </g>

          {/* ---- DAMAGE FEATURES (based on risk level) ---- */}

          {/* Cracks on sidewall */}
          {features.cracks.map((crack, idx) => (
            <path
              key={`crack-${idx}`}
              d={crack.d}
              stroke={color}
              strokeWidth="0.8"
              fill="none"
              opacity="0.9"
            />
          ))}

          {/* Air leak bubbles */}
          {features.leaks && (
            <>
              <circle cx="125" cy="78" r="2" fill={color} opacity="0.6" className="leak-bubble" style={{ animationDelay: '0s' }} />
              <circle cx="128" cy="72" r="1.5" fill={color} opacity="0.5" className="leak-bubble" style={{ animationDelay: '0.4s' }} />
              <circle cx="123" cy="85" r="1.8" fill={color} opacity="0.6" className="leak-bubble" style={{ animationDelay: '0.7s' }} />
              {level === 'critical' && (
                <circle cx="130" cy="76" r="2.2" fill={color} opacity="0.7" className="leak-bubble" style={{ animationDelay: '0.2s' }} />
              )}
            </>
          )}

          {/* Puncture mark (critical only) */}
          {features.puncture && (
            <g transform="translate(110, 65)">
              <circle cx="0" cy="0" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.9" />
              <line x1="-2" y1="-2" x2="2" y2="2" stroke={color} strokeWidth="0.8" />
              <line x1="2" y1="-2" x2="-2" y2="2" stroke={color} strokeWidth="0.8" />
            </g>
          )}

          {/* Sidewall bulge (critical only) */}
          {features.bulge && (
            <g className="bulge-animation">
              <path
                d="M58 95 Q52 90 56 85"
                stroke={color}
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M56 85 Q53 88 55 92"
                stroke={color}
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
            </g>
          )}

          {/* Warning icon inside hub (critical) */}
          {features.warningIcon && (
            <g transform="translate(80, 105)">
              <polygon points="0,-6 5,5 -5,5" fill="none" stroke={color} strokeWidth="1" />
              <line x1="0" y1="-1" x2="0" y2="2" stroke={color} strokeWidth="0.8" />
              <circle cx="0" cy="3.5" r="0.6" fill={color} />
            </g>
          )}
        </g>
      </svg>

      {/* Status label and pressure hint */}
      <div
        className="mt-2 text-xs font-semibold flex flex-col items-center"
        style={{ color, letterSpacing: '0.15em' }}
      >
        <span>{statusLabel[level].toUpperCase()}</span>
        {level !== 'safe' && (
          <span className="text-[10px] opacity-70 mt-0.5">
            {level === 'warn' && 'Check inflation'}
            {level === 'elevated' && 'Inspect sidewall'}
            {level === 'critical' && 'IMMEDIATE SERVICE'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TireFigure;
