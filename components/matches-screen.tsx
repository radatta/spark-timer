'use client'

import { useMemo } from 'react'
import type { Match } from '@/lib/data'
import { formatTimeLeft, getTimerStatus } from '@/lib/data'
import { MessageCircle, Clock, CheckCheck, Sparkles, Plus } from 'lucide-react'

type Props = {
  matches: Match[]
  now: number
  onOpenChat: (matchId: string) => void
  onExtendMatch: (matchId: string) => void
}

export function MatchesScreen({ matches, now, onOpenChat, onExtendMatch }: Props) {
  const sorted = useMemo(() => {
    return [...matches].sort((a, b) => {
      // messaged first, then active by urgency, then expired last
      const order = { messaged: 0, expiring: 1, active: 2, expired: 3 }
      return order[a.status] - order[b.status]
    })
  }, [matches])

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 px-8 text-center">
        <MessageCircle className="w-14 h-14 text-muted-foreground opacity-30" />
        <h3 className="text-lg font-semibold text-foreground">No matches yet</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Go back and swipe — your first match is out there waiting.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-5 pt-5 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Your Matches</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{sorted.length} connection{sorted.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {sorted.map((match) => {
          const msLeft = match.timerExpiresAt - now
          const timerStatus = getTimerStatus(msLeft)
          const isExpired = match.status === 'expired' || timerStatus === 'expired'
          const isMessaged = match.status === 'messaged'
          const canExtend =
            !isExpired && !isMessaged && !match.extended && (timerStatus === 'warning' || timerStatus === 'danger')

          const timerColor =
            timerStatus === 'danger'
              ? 'var(--spark-danger)'
              : timerStatus === 'warning'
              ? 'var(--spark-warning)'
              : 'var(--spark-success)'

          return (
            <div
              key={match.id}
              className="rounded-2xl"
              style={{
                background: 'var(--spark-surface)',
                border: '1px solid var(--border)',
                opacity: isExpired ? 0.6 : 1,
              }}
            >
              <button
                onClick={() => !isExpired && onOpenChat(match.id)}
                disabled={isExpired}
                className="w-full flex items-center gap-4 p-4 text-left"
                style={{ cursor: isExpired ? 'default' : 'pointer' }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden"
                    style={{
                      boxShadow: isExpired
                        ? 'none'
                        : isMessaged
                        ? '0 0 0 2px var(--spark-cyan)'
                        : `0 0 0 2px ${timerColor}`,
                      filter: isExpired ? 'grayscale(1)' : 'none',
                    }}
                  >
                    <img
                      src={match.profile.image}
                      alt={match.profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isExpired && (
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ background: 'oklch(0 0 0 / 0.4)' }}
                    >
                      <Clock className="w-5 h-5 text-white/60" />
                    </div>
                  )}

                  {/* Compatibility badge */}
                  {!isExpired && (
                    <div
                      className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: 'var(--spark-surface-elevated)',
                        border: '1px solid var(--spark-purple)',
                        color: 'var(--spark-cyan)',
                      }}
                      aria-label={`${match.profile.compatibility} percent compatible`}
                    >
                      <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                      {match.profile.compatibility}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-foreground">{match.profile.name}</span>

                    {isExpired ? (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'oklch(0.55 0.25 25 / 0.15)',
                          color: 'var(--spark-danger)',
                          border: '1px solid oklch(0.55 0.25 25 / 0.3)',
                        }}
                      >
                        Expired
                      </span>
                    ) : isMessaged ? (
                      <CheckCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--spark-cyan)' }} />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: timerColor }}
                        />
                        <span className="text-xs font-medium font-mono" style={{ color: timerColor }}>
                          {formatTimeLeft(msLeft)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p
                    className="text-sm text-muted-foreground truncate"
                    style={isExpired ? { fontStyle: 'italic' } : undefined}
                  >
                    {isExpired
                      ? 'Neither of you said hi in time. The spark fizzled.'
                      : isMessaged
                      ? match.lastMessage || 'Start chatting...'
                      : timerStatus === 'danger'
                      ? "Less than an hour left — don't let this one slip away!"
                      : 'Send a message before time runs out!'}
                  </p>
                </div>
              </button>

              {/* Extend Match button */}
              {canExtend && (
                <div className="px-4 pb-3 -mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onExtendMatch(match.id)
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 hover:opacity-90"
                    style={{
                      background: 'oklch(from var(--spark-purple) l c h / 0.15)',
                      border: '1px solid var(--spark-purple)',
                      color: 'var(--spark-purple)',
                    }}
                    aria-label={`Extend match with ${match.profile.name} by 12 hours`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Extend +12h (one time)
                  </button>
                </div>
              )}
              {match.extended && !isExpired && !isMessaged && (
                <div className="px-4 pb-3 -mt-1">
                  <div
                    className="w-full text-center py-1.5 rounded-xl text-[11px] font-medium"
                    style={{
                      background: 'oklch(from var(--spark-cyan) l c h / 0.08)',
                      color: 'var(--spark-cyan)',
                    }}
                  >
                    ✨ Extended +12h
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
