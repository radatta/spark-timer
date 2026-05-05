'use client'

import { Flame, Heart, MessageCircle } from 'lucide-react'

export type Tab = 'discover' | 'matches' | 'chat'

type Props = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  matchCount: number
}

export function BottomNav({ activeTab, onTabChange, matchCount }: Props) {
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    {
      id: 'discover',
      label: 'Discover',
      icon: <Flame className="w-6 h-6" />,
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: <Heart className="w-6 h-6" />,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-6 h-6" />,
    },
  ]

  return (
    <nav
      className="flex-shrink-0 flex items-center justify-around px-4 py-2 safe-area-bottom"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--spark-surface)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all"
            style={{
              color: isActive ? 'var(--spark-neon-pink)' : 'var(--muted-foreground)',
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className="transition-transform"
              style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
            >
              {tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>

            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: 'var(--spark-neon-pink)' }}
                aria-hidden="true"
              />
            )}

            {/* Match badge */}
            {tab.id === 'matches' && matchCount > 0 && !isActive && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ background: 'var(--spark-neon-pink)' }}
                aria-label={`${matchCount} unread matches`}
              >
                {matchCount > 9 ? '9+' : matchCount}
              </div>
            )}
          </button>
        )
      })}
    </nav>
  )
}
