'use client'

import { useState, useRef, useEffect } from 'react'
import type { Match, Message } from '@/lib/data'
import { formatTimeLeft, getTimerStatus } from '@/lib/data'
import { ArrowLeft, Send, Timer, Plus } from 'lucide-react'

type Props = {
  match: Match
  now: number
  onBack: () => void
  onSendMessage: (matchId: string, text: string) => void
  onExtendMatch: (matchId: string) => void
}

const BOT_REPLIES = [
  "That's so interesting! Tell me more 😊",
  "Haha, I love that! We have so much in common.",
  "Okay wait — that's actually really cool.",
  "I was literally just thinking about that!",
  "You seem like a lot of fun. What do you do on weekends?",
  "I'd love to hear more about that.",
  "Okay you're winning points here 😄",
  "That's hilarious, I can't believe that happened!",
]

let botReplyIndex = 0

export function ChatScreen({ match, now, onBack, onSendMessage, onExtendMatch }: Props) {
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState<Message[]>(match.messages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const msLeft = match.timerExpiresAt - now
  const timerStatus = getTimerStatus(msLeft)
  const showTimer = match.status !== 'messaged' && timerStatus !== 'expired'

  const timerColor =
    timerStatus === 'danger'
      ? 'var(--spark-danger)'
      : timerStatus === 'warning'
      ? 'var(--spark-warning)'
      : 'var(--spark-neon-pink)'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: Date.now(),
    }

    setLocalMessages((prev) => [...prev, newMsg])
    setInput('')
    onSendMessage(match.id, text)

    // Simulate a reply after a short delay
    setTimeout(() => {
      const reply: Message = {
        id: `reply${Date.now()}`,
        senderId: match.profile.id,
        text: BOT_REPLIES[botReplyIndex % BOT_REPLIES.length],
        timestamp: Date.now(),
      }
      botReplyIndex++
      setLocalMessages((prev) => [...prev, reply])
    }, 1200 + Math.random() * 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--spark-surface)',
        }}
      >
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back to matches"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={match.profile.image}
            alt={match.profile.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground">{match.profile.name}</div>
          <div className="text-xs text-muted-foreground">Active now</div>
        </div>

        {/* Timer in header */}
        {showTimer && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'oklch(from var(--spark-neon-pink) l c h / 0.1)',
              border: `1px solid ${timerColor}`,
            }}
          >
            <Timer className="w-3 h-3" style={{ color: timerColor }} />
            <span className="text-xs font-semibold font-mono" style={{ color: timerColor }}>
              {formatTimeLeft(msLeft)}
            </span>
          </div>
        )}
      </header>

      {/* Timer banner */}
      {showTimer && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 text-xs font-medium"
          style={{
            background:
              timerStatus === 'danger'
                ? 'oklch(0.55 0.25 25 / 0.12)'
                : timerStatus === 'warning'
                ? 'oklch(0.7 0.2 60 / 0.1)'
                : 'oklch(0.65 0.32 350 / 0.08)',
            borderBottom: `1px solid ${timerColor}30`,
            color: timerColor,
          }}
        >
          <Timer className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">
            {timerStatus === 'danger'
              ? `Hurry! Expires in ${formatTimeLeft(msLeft)}. Send a message now!`
              : `Expires in ${formatTimeLeft(msLeft)}. Say hello to keep the spark alive!`}
          </span>
          {!match.extended && (timerStatus === 'danger' || timerStatus === 'warning') && (
            <button
              onClick={() => onExtendMatch(match.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-full font-bold transition-transform active:scale-95"
              style={{
                background: 'var(--spark-purple)',
                color: 'white',
                fontSize: '11px',
              }}
              aria-label="Extend match by 12 hours"
            >
              <Plus className="w-3 h-3" />
              +12h
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={match.profile.image}
                alt={match.profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              You matched with <strong className="text-foreground">{match.profile.name}</strong>!
              Say something — a simple &ldquo;hey&rdquo; goes a long way.
            </p>
          </div>
        ) : (
          localMessages.map((msg) => {
            const isMe = msg.senderId === 'me'
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 self-end">
                    <img
                      src={match.profile.image}
                      alt={match.profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className="max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={
                    isMe
                      ? {
                          background: 'linear-gradient(135deg, var(--spark-pink), var(--spark-purple))',
                          color: 'white',
                          borderBottomRightRadius: '4px',
                        }
                      : {
                          background: 'var(--spark-surface-elevated)',
                          color: 'var(--foreground)',
                          borderBottomLeftRadius: '4px',
                          border: '1px solid var(--border)',
                        }
                  }
                >
                  {msg.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--spark-surface)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${match.profile.name}...`}
          className="flex-1 bg-secondary rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 transition-all"
          style={{ outlineColor: 'var(--spark-pink)' }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, var(--spark-pink), var(--spark-purple))'
              : 'var(--spark-surface-elevated)',
          }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
