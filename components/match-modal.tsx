'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { TimerRing } from './timer-ring'
import type { Match } from '@/lib/data'
import { X } from 'lucide-react'

type Props = {
  match: Match
  onSendMessage: (matchId: string) => void
  onKeepSwiping: () => void
  onClose: () => void
}

const MATCH_DURATION_MS = 24 * 60 * 60 * 1000

export function MatchModal({ match, onSendMessage, onKeepSwiping, onClose }: Props) {
  const [msLeft, setMsLeft] = useState(() => match.timerExpiresAt - Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const confettiFired = useRef(false)

  // Countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMsLeft(match.timerExpiresAt - Date.now())
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [match.timerExpiresAt])

  // Confetti burst
  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...opts,
        origin: { y: 0.5 },
        particleCount: Math.floor(200 * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff3a6e', '#a855f7', '#06b6d4'] })
    fire(0.2, { spread: 60, colors: ['#ff3a6e', '#a855f7'] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#ff3a6e', '#ffffff'] })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#06b6d4', '#a855f7'] })
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#ff3a6e', '#a855f7', '#06b6d4'] })
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: 'oklch(0.04 0.015 270 / 0.95)', backdropFilter: 'blur(12px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="It's a Match!"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close match screen"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-5xl font-black mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, var(--spark-neon-pink), var(--spark-purple), var(--spark-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          It&apos;s a Match!
        </h1>
        <p className="text-muted-foreground text-sm">You and {match.profile.name} liked each other</p>
      </div>

      {/* Photos */}
      <div className="flex items-center justify-center mb-10 relative">
        <div
          className="w-28 h-28 rounded-full overflow-hidden ring-4 z-10 -mr-5"
          style={{ ringColor: 'var(--spark-neon-pink)', boxShadow: '0 0 0 4px var(--spark-neon-pink)' }}
        >
          <img
            src="https://picsum.photos/seed/myprofile/200/200"
            alt="Your profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="w-28 h-28 rounded-full overflow-hidden ring-4 z-10 -ml-5"
          style={{ boxShadow: '0 0 0 4px var(--spark-purple)' }}
        >
          <img
            src={match.profile.image}
            alt={match.profile.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center mb-8">
        <TimerRing msLeft={msLeft} totalMs={MATCH_DURATION_MS} size={180} strokeWidth={10} label="to send a message" />
        <p className="text-muted-foreground text-xs mt-3 text-center max-w-xs leading-relaxed">
          Send a message within 24 hours or this match will disappear forever
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={() => onSendMessage(match.id)}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--spark-pink), var(--spark-purple))',
            color: 'white',
            boxShadow: '0 8px 30px oklch(0.65 0.32 350 / 0.4)',
          }}
        >
          Send First Message
        </button>
        <button
          onClick={onKeepSwiping}
          className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 hover:bg-secondary"
          style={{
            background: 'var(--spark-surface-elevated)',
            color: 'var(--muted-foreground)',
            border: '1px solid var(--border)',
          }}
        >
          Keep Swiping
        </button>
      </div>
    </div>
  )
}
