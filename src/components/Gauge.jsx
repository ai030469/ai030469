import { useEffect, useState } from 'react'

export default function Gauge({ value, max, label, color = '#26a69a', icon }) {
  const [animated, setAnimated] = useState(0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference - pct * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(offset), 100)
    return () => clearTimeout(timer)
  }, [offset])

  return (
    <div className="watercolor-card rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm flex-1 min-w-[140px]">
      <div className="relative">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke="#e0f2f1"
            strokeWidth="8"
          />
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon}
          <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 text-center relative z-10">{label}</span>
    </div>
  )
}
