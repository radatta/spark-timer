'use client'

import { useMemo } from 'react'
import { formatCountdown } from '@/lib/data'

type Props = {
  msLeft: number
  totalMs: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function TimerRing({ msLeft, totalMs, size = 160, strokeWidth = 8, label }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = totalMs > 0 ? Math.max(0, msLeft / totalMs) : 0
  const dashOffset = circumference * (1 - progress)

  const isDanger = msLeft < 2 * 60 * 60 * 1000
  const isWarning = msLeft < 6 * 60 * 60 * 1000

  const strokeColor = useMemo(() => {
    if (isDanger) return 'var(--spark-danger)'
    if (isWarning) return 'var(--spark-warning)'
    return 'var(--spark-neon-pink)'
  }, [isDanger, isWarning])

  const glowColor = useMemo(() => {
    if (isDanger) return 'oklch(0.62 0.25 30 / 0.6)'
    if (isWarning) return 'oklch(0.7 0.2 60 / 0.5)'
    return 'oklch(0.68 0.33 350 / 0.6)'
  }, [isDanger, isWarning])

  const timeText = formatCountdown(msLeft)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.22 0.02 270)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold tracking-wider tabular-nums"
          style={{
            fontSize: size * 0.145,
            color: isDanger ? 'var(--spark-danger)' : isWarning ? 'var(--spark-warning)' : 'var(--spark-neon-pink)',
          }}
        >
          {timeText}
        </span>
        {label && (
          <span
            className="text-muted-foreground mt-0.5 text-center leading-tight"
            style={{ fontSize: size * 0.075 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
