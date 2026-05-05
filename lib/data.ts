export type Profile = {
  id: string
  name: string
  age: number
  distance: number
  bio: string
  interests: string[]
  image: string
}

export type MatchStatus = 'active' | 'expiring' | 'expired' | 'messaged'

export type Match = {
  id: string
  profile: Profile
  matchedAt: number // timestamp in ms
  timerExpiresAt: number // timestamp in ms
  status: MatchStatus
  messages: Message[]
  lastMessage?: string
}

export type Message = {
  id: string
  senderId: string // 'me' | profileId
  text: string
  timestamp: number
}

export const PROFILES: Profile[] = [
  {
    id: 'p1',
    name: 'Sophia',
    age: 26,
    distance: 3,
    bio: 'Coffee addict, weekend hiker, and terrible at cooking. Looking for someone to eat takeout with.',
    interests: ['Hiking', 'Coffee', 'Photography', 'Travel'],
    image: 'https://picsum.photos/seed/sophia/600/800',
  },
  {
    id: 'p2',
    name: 'Elena',
    age: 28,
    distance: 7,
    bio: 'Art museum enthusiast by day, thriller novel reader by night. Dogs are mandatory.',
    interests: ['Art', 'Reading', 'Dogs', 'Yoga'],
    image: 'https://picsum.photos/seed/elena/600/800',
  },
  {
    id: 'p3',
    name: 'Maya',
    age: 24,
    distance: 2,
    bio: 'Startup founder who still watches reality TV. Living for the contradictions.',
    interests: ['Startups', 'Cooking', 'Reality TV', 'Gym'],
    image: 'https://picsum.photos/seed/maya/600/800',
  },
  {
    id: 'p4',
    name: 'Isabelle',
    age: 30,
    distance: 12,
    bio: 'Architect. I design buildings and also overdesign my Spotify playlists.',
    interests: ['Architecture', 'Music', 'Wine', 'Design'],
    image: 'https://picsum.photos/seed/isabelle/600/800',
  },
  {
    id: 'p5',
    name: 'Zoe',
    age: 25,
    distance: 5,
    bio: 'Marine biologist. Yes, I have swum with sharks. No, I am not scared.',
    interests: ['Ocean', 'Diving', 'Science', 'Running'],
    image: 'https://picsum.photos/seed/zoe/600/800',
  },
  {
    id: 'p6',
    name: 'Natasha',
    age: 27,
    distance: 9,
    bio: 'Freelance photographer. I will make you look good in every photo.',
    interests: ['Photography', 'Travel', 'Concerts', 'Foodie'],
    image: 'https://picsum.photos/seed/natasha/600/800',
  },
  {
    id: 'p7',
    name: 'Aria',
    age: 23,
    distance: 4,
    bio: 'Studying neuroscience. Loves puzzles, escape rooms, and oat milk lattes.',
    interests: ['Science', 'Puzzles', 'Yoga', 'Cats'],
    image: 'https://picsum.photos/seed/aria/600/800',
  },
  {
    id: 'p8',
    name: 'Luna',
    age: 29,
    distance: 6,
    bio: 'Chef by trade, climber by weekend. Will feed you very well.',
    interests: ['Cooking', 'Climbing', 'Hiking', 'Wine'],
    image: 'https://picsum.photos/seed/luna/600/800',
  },
  {
    id: 'p9',
    name: 'Camille',
    age: 31,
    distance: 14,
    bio: 'Journalist. I ask a lot of questions — hopefully you do too.',
    interests: ['Writing', 'Travel', 'Politics', 'Jazz'],
    image: 'https://picsum.photos/seed/camille/600/800',
  },
  {
    id: 'p10',
    name: 'Jade',
    age: 26,
    distance: 1,
    bio: 'Software engineer. I debug code and also my own life. Slowly.',
    interests: ['Tech', 'Gaming', 'Coffee', 'Cycling'],
    image: 'https://picsum.photos/seed/jade/600/800',
  },
]

const MATCH_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function createInitialMatches(): Match[] {
  const now = Date.now()

  return [
    // Active match — 18h left
    {
      id: 'm1',
      profile: PROFILES[1],
      matchedAt: now - 6 * 60 * 60 * 1000,
      timerExpiresAt: now + 18 * 60 * 60 * 1000,
      status: 'active',
      messages: [],
    },
    // Expiring soon — 2.5h left
    {
      id: 'm2',
      profile: PROFILES[3],
      matchedAt: now - 21.5 * 60 * 60 * 1000,
      timerExpiresAt: now + 2.5 * 60 * 60 * 1000,
      status: 'expiring',
      messages: [],
    },
    // Expired match
    {
      id: 'm3',
      profile: PROFILES[5],
      matchedAt: now - MATCH_DURATION_MS - 2 * 60 * 60 * 1000,
      timerExpiresAt: now - 2 * 60 * 60 * 1000,
      status: 'expired',
      messages: [],
    },
    // Already messaged — timer gone
    {
      id: 'm4',
      profile: PROFILES[7],
      matchedAt: now - 10 * 60 * 60 * 1000,
      timerExpiresAt: now + 14 * 60 * 60 * 1000,
      status: 'messaged',
      messages: [
        {
          id: 'msg1',
          senderId: 'me',
          text: "Hey Luna! I noticed you're a chef — what's your go-to dish to impress someone? 👨‍🍳",
          timestamp: now - 9 * 60 * 60 * 1000,
        },
        {
          id: 'msg2',
          senderId: PROFILES[7].id,
          text: "Haha great question! I usually go with my saffron risotto — simple but perfect. What about you?",
          timestamp: now - 8 * 60 * 60 * 1000,
        },
        {
          id: 'msg3',
          senderId: 'me',
          text: "Takeout 😅 But I am very good at picking the right restaurant.",
          timestamp: now - 7 * 60 * 60 * 1000,
        },
      ],
      lastMessage: 'Takeout 😅 But I am very good at picking the right restaurant.',
    },
  ]
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Expired'
  const totalMin = Math.floor(ms / 60000)
  if (totalMin < 60) return `${totalMin}m left`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`
}

export function getTimerStatus(msLeft: number): 'safe' | 'warning' | 'danger' | 'expired' {
  if (msLeft <= 0) return 'expired'
  if (msLeft < 2 * 60 * 60 * 1000) return 'danger'
  if (msLeft < 6 * 60 * 60 * 1000) return 'warning'
  return 'safe'
}
