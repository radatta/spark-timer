# Technical Specification: Mutual Interest Timer Dating App

**Project Name:** SparkTimer
**Version:** 1.0  
**Date:** May 2026  

### 1. Project Overview
A minimal viable dating app with core swipe functionality + one unique feature: **Mutual Interest Timer**.

After two users mutually like each other, a **24-hour countdown timer** begins. The first message must be sent within this window, otherwise the match automatically expires.

**Goal:** Reduce ghosting, create urgency, and increase conversation quality.

### 2. Core Features

#### 2.1 Basic Dating App Flow (MVP)
- User profile cards with photo, name, age, bio, and 2–3 tags
- Swipe Left (Nope) / Swipe Right (Like)
- Match screen when mutual like occurs
- Match list page
- Basic chat screen (one-to-one)

#### 2.2 Unique Feature: Mutual Interest Timer

**Rules:**
- Timer starts immediately upon mutual match (24 hours).
- Only **one first message** needs to be sent by either party to "save" the match.
- If no message is sent within 24 hours → match is automatically removed from both users’ match lists.
- Timer is visible on the Match screen and inside the chat.

### 3. Technical Requirements

**Tech Stack (Recommended for speed):**
- Frontend: React 18 + Vite
- Styling: Tailwind CSS
- State Management: React hooks (`useState`, `useEffect`) + `localStorage` for persistence
- UI Library (optional): `react-tinder-card` for swipe gestures
- Date Handling: Native JavaScript `Date` or `date-fns` (lightweight)

**No backend required** – everything runs client-side with localStorage.

### 4. Data Models

#### User Profile
```js
{
  id: string,
  name: string,
  age: number,
  photo: string (URL),
  bio: string,
  tags: string[],
  location?: string
}
```

#### Match Object
```js
{
  id: string,                    // e.g. "match_user1_user2"
  user1Id: string,
  user2Id: string,
  matchedAt: string (ISO timestamp),
  expiresAt: string (ISO timestamp),   // matchedAt + 24 hours
  firstMessageSent: boolean,
  lastMessageAt?: string,
  messages: Array<{
    id: string,
    senderId: string,
    text: string,
    timestamp: string
  }>
}
```

### 5. Key Screens & Components

1. **Home / Discovery Screen**
   - Stack of profile cards
   - Swipe buttons (X and Heart)

2. **Match Screen** (Modal / Full page)
   - Big photos of both users
   - “It’s a Match!” animation
   - Large countdown timer (HH:MM:SS)
   - Button: “Send First Message”

3. **Matches List**
   - List of active matches
   - Show timer if still active (e.g., “Expires in 14h 32m”)
   - Visual indicator (green → yellow → red)

4. **Chat Screen**
   - If timer is active and no message sent → prominent timer banner at top
   - After first message → timer disappears

5. **Expired Matches** (optional)
   - Soft notification: “This match expired”

### 6. Timer Logic (Critical)

- Use `setInterval` to update countdown every second.
- On app load / match list view: check all matches and remove expired ones.
- `expiresAt = new Date(matchedAt).getTime() + 24 * 60 * 60 * 1000`
- Display format: `hh:mm:ss`
- When timer reaches 00:00:00 → auto-remove match and show toast.

**Edge Cases:**
- User closes app → timer continues (calculated on next open)
- Same user opens on multiple tabs (localStorage sync)
- Timer under 1 hour → change color to red + warning text

### 7. UI/UX Guidelines

- Modern, clean, dark/light mode (Tailwind)
- Use gradients and subtle animations
- Timer should be the hero element on match screen
- Confetti or heart particles on new match (use `canvas-confetti` library – very small)
- Mobile-first responsive design

### 8. Sample Fake Data

Provide 8–12 fake users with attractive Unsplash/Picsum image URLs.

### 9. Bonus Polish (If Time Allows)

- “Extend Match” button (once per match, +12 hours)
- Push notification simulation (toast when match is about to expire)
- “Why did it expire?” gentle message
- Match compatibility score (optional)

### 10. Video Presentation Points

- Problem: High ghosting rate in modern dating apps
- Solution: Mutual Interest Timer
- Demo: Live swipe → match → timer countdown
- Business value & user psychology
- Technical implementation overview
- Future improvements

