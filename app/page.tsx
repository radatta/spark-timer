'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DiscoverScreen } from '@/components/discover-screen'
import { MatchModal } from '@/components/match-modal'
import { MatchesScreen } from '@/components/matches-screen'
import { ChatScreen } from '@/components/chat-screen'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import {
  type Match,
  createInitialMatches,
  DANGER_THRESHOLD_MS,
  WARNING_THRESHOLD_MS,
  EXTEND_BONUS_MS,
} from '@/lib/data'
import { toast } from 'sonner'

const STORAGE_KEY = 'sparktimer_matches_v2'

function loadMatches(): Match[] {
  if (typeof window === 'undefined') return createInitialMatches()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Match[]
  } catch {
    // ignore
  }
  return createInitialMatches()
}

function saveMatches(matches: Match[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
  } catch {
    // ignore
  }
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>(() => createInitialMatches())
  const [activeTab, setActiveTab] = useState<Tab>('discover')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [pendingMatch, setPendingMatch] = useState<Match | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Per-session toast tracking so we don't spam
  const expiredToasted = useRef<Set<string>>(new Set())
  const aboutToExpireToasted = useRef<Set<string>>(new Set())

  // Tick every second for timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    setMatches(loadMatches())
  }, [])

  // Sync across tabs via storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const incoming = JSON.parse(e.newValue) as Match[]
        setMatches(incoming)
      } catch {
        // ignore malformed payloads
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Auto-expire & status transitions, with toasts
  useEffect(() => {
    setMatches((prev) => {
      let changed = false
      const updated = prev.map((m) => {
        const msLeft = m.timerExpiresAt - now

        // Just expired
        if (m.status !== 'expired' && m.status !== 'messaged' && msLeft <= 0) {
          changed = true
          if (!expiredToasted.current.has(m.id)) {
            expiredToasted.current.add(m.id)
            toast.error(`Match with ${m.profile.name} expired`, {
              description: 'No message was sent in time. The spark is gone.',
            })
          }
          return { ...m, status: 'expired' as const }
        }

        // About-to-expire warning (under 1h, first time we see it this session)
        if (
          (m.status === 'active' || m.status === 'expiring') &&
          msLeft > 0 &&
          msLeft < DANGER_THRESHOLD_MS &&
          !aboutToExpireToasted.current.has(m.id)
        ) {
          aboutToExpireToasted.current.add(m.id)
          toast(`⏰ ${m.profile.name} expires in under an hour!`, {
            description: 'Send a message now or extend the match.',
          })
        }

        // Promote 'active' → 'expiring' once we cross the 6h mark
        if (m.status === 'active' && msLeft < WARNING_THRESHOLD_MS && msLeft > 0) {
          changed = true
          return { ...m, status: 'expiring' as const }
        }

        return m
      })

      if (changed) {
        saveMatches(updated)
        return updated
      }
      return prev
    })
  }, [now])

  const handleNewMatch = useCallback((match: Match) => {
    setMatches((prev) => {
      const updated = [match, ...prev]
      saveMatches(updated)
      return updated
    })
    setPendingMatch(match)
  }, [])

  const handleSendFirstMessage = useCallback((matchId: string) => {
    setPendingMatch(null)
    setMatches((prev) => {
      const updated = prev.map((m) =>
        m.id === matchId ? { ...m, status: 'messaged' as const } : m
      )
      saveMatches(updated)
      return updated
    })
    setActiveChatId(matchId)
    setActiveTab('chat')
  }, [])

  const handleOpenChat = useCallback((matchId: string) => {
    setActiveChatId(matchId)
    setActiveTab('chat')
  }, [])

  const handleSendMessage = useCallback((matchId: string, text: string) => {
    setMatches((prev) => {
      const updated = prev.map((m) => {
        if (m.id === matchId) {
          const newMsg = {
            id: `msg${Date.now()}`,
            senderId: 'me',
            text,
            timestamp: Date.now(),
          }
          return {
            ...m,
            status: 'messaged' as const,
            messages: [...m.messages, newMsg],
            lastMessage: text,
          }
        }
        return m
      })
      saveMatches(updated)
      return updated
    })
    toast('Message sent!', { description: 'The timer has been removed for this match.' })
  }, [])

  const handleExtendMatch = useCallback((matchId: string) => {
    setMatches((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== matchId || m.extended || m.status === 'expired' || m.status === 'messaged') {
          return m
        }
        const newExpiresAt = m.timerExpiresAt + EXTEND_BONUS_MS
        const msLeft = newExpiresAt - Date.now()
        const newStatus: Match['status'] = msLeft >= WARNING_THRESHOLD_MS ? 'active' : 'expiring'
        return { ...m, timerExpiresAt: newExpiresAt, extended: true, status: newStatus }
      })
      saveMatches(updated)
      return updated
    })
    // Reset the "about to expire" guard so a re-warn can fire later if it dips again
    aboutToExpireToasted.current.delete(matchId)
    toast.success('Match extended +12h', { description: 'You bought yourself some time.' })
  }, [])

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    if (tab !== 'chat') setActiveChatId(null)
  }, [])

  const activeMatch = activeChatId ? matches.find((m) => m.id === activeChatId) : null
  const unmessagedMatchCount = matches.filter(
    (m) => m.status === 'active' || m.status === 'expiring'
  ).length

  return (
    <main
      className="flex flex-col mx-auto overflow-hidden"
      style={{
        maxWidth: '480px',
        height: '100svh',
        background: 'var(--background)',
        position: 'relative',
      }}
    >
      {/* Screen content */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'discover' && (
          <div className="absolute inset-0">
            <DiscoverScreen onMatch={handleNewMatch} />
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="absolute inset-0">
            <MatchesScreen
              matches={matches}
              now={now}
              onOpenChat={handleOpenChat}
              onExtendMatch={handleExtendMatch}
            />
          </div>
        )}

        {activeTab === 'chat' && activeMatch ? (
          <div className="absolute inset-0">
            <ChatScreen
              match={activeMatch}
              now={now}
              onBack={() => {
                setActiveChatId(null)
                setActiveTab('matches')
              }}
              onSendMessage={handleSendMessage}
              onExtendMatch={handleExtendMatch}
            />
          </div>
        ) : activeTab === 'chat' ? (
          <div className="absolute inset-0">
            <MatchesScreen
              matches={matches}
              now={now}
              onOpenChat={handleOpenChat}
              onExtendMatch={handleExtendMatch}
            />
          </div>
        ) : null}
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab === 'chat' && !activeMatch ? 'matches' : activeTab}
        onTabChange={handleTabChange}
        matchCount={unmessagedMatchCount}
      />

      {/* Match Modal overlay */}
      {pendingMatch && (
        <MatchModal
          match={pendingMatch}
          onSendMessage={handleSendFirstMessage}
          onKeepSwiping={() => setPendingMatch(null)}
          onClose={() => setPendingMatch(null)}
        />
      )}
    </main>
  )
}
