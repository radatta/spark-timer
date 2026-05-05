'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapPin, Zap } from 'lucide-react'
import { SwipeCard } from './swipe-card'
import { PROFILES, type Match, type Profile } from '@/lib/data'
import { toast } from 'sonner'

type Props = {
  onMatch: (match: Match) => void
}

const CARD_POOL = PROFILES.slice(0, 10)
const SWIPE_HINT_KEY = 'sparktimer_swipe_hint_seen'

export function DiscoverScreen({ onMatch }: Props) {
  const [stack, setStack] = useState<Profile[]>(CARD_POOL)
  const [gone, setGone] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState(false)

  // Show hint once per browser, on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem(SWIPE_HINT_KEY)) setShowHint(true)
    } catch {
      // ignore
    }
  }, [])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    try {
      localStorage.setItem(SWIPE_HINT_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  const handleSwipe = useCallback(
    (profile: Profile, direction: 'left' | 'right') => {
      dismissHint()
      setGone((prev) => new Set([...prev, profile.id]))
      setTimeout(() => {
        setStack((prev) => prev.filter((p) => p.id !== profile.id))
      }, 400)

      if (direction === 'right') {
        // ~40% chance of a mutual match for demo purposes
        const isMatch = Math.random() > 0.6
        if (isMatch) {
          const now = Date.now()
          const newMatch: Match = {
            id: `m${Date.now()}`,
            profile,
            matchedAt: now,
            timerExpiresAt: now + 24 * 60 * 60 * 1000,
            status: 'active',
            messages: [],
          }
          setTimeout(() => onMatch(newMatch), 450)
        } else {
          toast(`You liked ${profile.name}!`, {
            description: 'Keep swiping for more matches.',
          })
        }
      }
    },
    [onMatch, dismissHint]
  )

  const handleSwipeLeft = useCallback(
    (profile: Profile) => handleSwipe(profile, 'left'),
    [handleSwipe]
  )
  const handleSwipeRight = useCallback(
    (profile: Profile) => handleSwipe(profile, 'right'),
    [handleSwipe]
  )

  const topProfile = stack[0]

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" style={{ color: 'var(--spark-cyan)' }} />
          <span>San Francisco</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-5 h-5" style={{ color: 'var(--spark-neon-pink)' }} />
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: 'var(--spark-neon-pink)' }}
          >
            SparkTimer
          </span>
        </div>

        <div
          className="w-9 h-9 rounded-full overflow-hidden ring-2"
          style={{ outlineColor: 'var(--spark-pink)' }}
        >
          <img
            src="https://picsum.photos/seed/myprofile/100/100"
            alt="Your profile"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Card Area */}
      <div className="flex-1 relative mx-4 my-2 min-h-0">
        {stack.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
            <Zap className="w-16 h-16" style={{ color: 'var(--spark-neon-pink)', opacity: 0.4 }} />
            <h3 className="text-xl font-bold text-foreground">You&apos;ve seen everyone!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Check back later for new people in your area.
            </p>
          </div>
        ) : (
          stack
            .slice(0, 3)
            .reverse()
            .map((profile, reversedIndex) => {
              const stackIndex = Math.min(2, stack.length - 1) - reversedIndex
              return (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isTop={stackIndex === 0}
                  stackIndex={stackIndex}
                  onSwipeLeft={() => handleSwipeLeft(profile)}
                  onSwipeRight={() => handleSwipeRight(profile)}
                />
              )
            })
        )}
      </div>

      {/* First-visit swipe hint */}
      {showHint && topProfile && (
        <button
          onClick={dismissHint}
          className="swipe-hint mx-auto mb-1 mt-1 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium flex-shrink-0"
          style={{
            background: 'oklch(0.15 0.02 270 / 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid oklch(1 0 0 / 0.1)',
            color: 'oklch(0.8 0.01 270)',
          }}
          aria-label="Dismiss swipe hint"
        >
          <span style={{ color: 'var(--spark-danger)' }}>←</span>
          <span>swipe or tap to choose</span>
          <span style={{ color: 'var(--spark-neon-pink)' }}>→</span>
        </button>
      )}

      {/* Action Buttons */}
      {topProfile && (
        <div className="flex items-center justify-center gap-6 py-5 flex-shrink-0">
          {/* Pass */}
          <button
            aria-label={`Pass on ${topProfile.name}`}
            onClick={() => handleSwipeLeft(topProfile)}
            className="flex items-center justify-center w-16 h-16 rounded-full transition-transform active:scale-90 hover:scale-105"
            style={{
              background: 'var(--spark-surface-elevated)',
              border: '2px solid var(--spark-danger)',
              boxShadow: '0 0 20px oklch(0.55 0.25 25 / 0.25)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="var(--spark-danger)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Like */}
          <button
            aria-label={`Like ${topProfile.name}`}
            onClick={() => handleSwipeRight(topProfile)}
            className="flex items-center justify-center w-20 h-20 rounded-full transition-transform active:scale-90 hover:scale-105 neon-glow-pink"
            style={{
              background: 'linear-gradient(135deg, var(--spark-pink), var(--spark-purple))',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
