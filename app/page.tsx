'use client'

import { useState, useEffect, useCallback } from 'react'
import { DiscoverScreen } from '@/components/discover-screen'
import { MatchModal } from '@/components/match-modal'
import { MatchesScreen } from '@/components/matches-screen'
import { ChatScreen } from '@/components/chat-screen'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { type Match, createInitialMatches } from '@/lib/data'
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

  // Tick every second for timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    setMatches(loadMatches())
  }, [])

  // Auto-expire matches
  useEffect(() => {
    setMatches((prev) => {
      let changed = false
      const updated = prev.map((m) => {
        if (m.status !== 'expired' && m.status !== 'messaged' && now > m.timerExpiresAt) {
          changed = true
          return { ...m, status: 'expired' as const }
        }
        if (m.status === 'active' && m.timerExpiresAt - now < 6 * 60 * 60 * 1000) {
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
            <MatchesScreen matches={matches} now={now} onOpenChat={handleOpenChat} />
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
            />
          </div>
        ) : activeTab === 'chat' ? (
          <div className="absolute inset-0">
            <MatchesScreen matches={matches} now={now} onOpenChat={handleOpenChat} />
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
