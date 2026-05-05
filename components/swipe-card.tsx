'use client'

import { useRef, useState, useCallback } from 'react'
import type { Profile } from '@/lib/data'
import { MapPin, Sparkles } from 'lucide-react'

type Props = {
  profile: Profile
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
  stackIndex: number
}

const SWIPE_THRESHOLD = 80

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight, isTop, stackIndex }: Props) {
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop) return
      startRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      cardRef.current?.setPointerCapture(e.pointerId)
    },
    [isTop]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !startRef.current) return
      setDragX(e.clientX - startRef.current.x)
      setDragY(e.clientY - startRef.current.y)
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragX > SWIPE_THRESHOLD) {
      setExitDir('right')
      setTimeout(() => onSwipeRight(), 350)
    } else if (dragX < -SWIPE_THRESHOLD) {
      setExitDir('left')
      setTimeout(() => onSwipeLeft(), 350)
    } else {
      setDragX(0)
      setDragY(0)
    }
    startRef.current = null
  }, [isDragging, dragX, onSwipeLeft, onSwipeRight])

  const rotation = dragX * 0.06
  const likeOpacity = Math.min(dragX / SWIPE_THRESHOLD, 1)
  const nopeOpacity = Math.min(-dragX / SWIPE_THRESHOLD, 1)

  let transform = ''
  let transition = ''

  if (exitDir === 'right') {
    transform = 'translateX(120%) rotate(20deg)'
    transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'
  } else if (exitDir === 'left') {
    transform = 'translateX(-120%) rotate(-20deg)'
    transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'
  } else if (isDragging) {
    transform = `translateX(${dragX}px) translateY(${dragY * 0.3}px) rotate(${rotation}deg)`
    transition = 'none'
  } else {
    const scale = isTop ? 1 : Math.max(0.88, 1 - stackIndex * 0.04)
    const yOffset = isTop ? 0 : stackIndex * 12
    transform = `scale(${scale}) translateY(${yOffset}px)`
    transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)'
  }

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 swipe-card select-none"
      style={{
        transform,
        transition,
        zIndex: 10 - stackIndex,
        cursor: isTop ? 'grab' : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Card */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden card-glow"
        style={{ background: 'var(--spark-surface)' }}
      >
        {/* Photo */}
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 45%, oklch(0 0 0 / 0.3) 65%, oklch(0 0 0 / 0.85) 100%)',
          }}
        />

        {/* Compatibility pill */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold pointer-events-none"
          style={{
            background: 'oklch(0 0 0 / 0.45)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid oklch(1 0 0 / 0.18)',
          }}
          aria-label={`${profile.compatibility} percent compatible`}
        >
          <Sparkles className="w-3 h-3" style={{ color: 'var(--spark-cyan)' }} aria-hidden="true" />
          {profile.compatibility}% match
        </div>

        {/* LIKE indicator */}
        <div
          className="absolute top-10 left-6 rotate-[-20deg] border-4 rounded-xl px-3 py-1 pointer-events-none"
          style={{
            borderColor: 'var(--spark-success)',
            color: 'var(--spark-success)',
            opacity: likeOpacity,
          }}
          aria-hidden="true"
        >
          <span className="font-black text-2xl tracking-widest">LIKE</span>
        </div>

        {/* NOPE indicator */}
        <div
          className="absolute top-10 right-6 rotate-[20deg] border-4 rounded-xl px-3 py-1 pointer-events-none"
          style={{
            borderColor: 'var(--spark-danger)',
            color: 'var(--spark-danger)',
            opacity: nopeOpacity,
          }}
          aria-hidden="true"
        >
          <span className="font-black text-2xl tracking-widest">NOPE</span>
        </div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-white text-balance">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-1 text-white/70 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{profile.distance} km away</span>
              </div>
            </div>
          </div>

          <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2">{profile.bio}</p>

          <div className="flex flex-wrap gap-2">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  background: 'oklch(1 0 0 / 0.12)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  border: '1px solid oklch(1 0 0 / 0.18)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
