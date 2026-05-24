# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (default port 3000; may shift to 3002 if busy)
- `npm run build` — production build
- `npm start` — serve built app
- `npm run lint` — ESLint via `eslint-config-next` (core-web-vitals + typescript)

No test runner is configured.

## Stack

- Next.js 16.1.5, App Router, React 19, TypeScript (strict)
- Framer Motion (incl. `Reorder.Group` for drag-and-drop tasks, `AnimatePresence` for mount/unmount)
- `lucide-react` icons, `canvas-confetti` on timer completion, `react-youtube` for hidden audio player, `date-fns` (currently unused in src)
- Path alias: `@/*` → `./src/*`

## Architecture

Single-page client app. `src/app/page.tsx` is a server component shell that renders three sibling client islands side-by-side inside `.main-container`:

- `src/components/PomodoroTimer.tsx` — 3 modes (`pomodoro`/`shortBreak`/`longBreak`) defined in a `MODES` record with `time`, `color`, `icon`. `setInterval` drives countdown; on `timeLeft === 0` fires Mixkit MP3 (remote URL), `Notification` API (permission requested on mount + on toggle), and confetti.
- `src/components/TaskTracker.tsx` — task list with localStorage key `flowstate-tasks` (load on mount, save on every `tasks` change). Drag-reorder via Framer `Reorder.Group`/`Reorder.Item`. New tasks prepended.
- `src/components/MusicPlayer.tsx` — `TRACKS` array of YouTube `videoId`s rendered through `<YouTube>` inside a `display: none` wrapper. **The hidden div is load-bearing**: it blocks Arc browser's Auto-PiP (see commits `5c67ca3`, `a98ebfc`). Do not replace `display: none` with `visibility: hidden`, opacity, or off-screen positioning. The visible "video" area is a styled placeholder, not the iframe.

State lives entirely in component-local `useState`. No global store, no API routes, no backend.

## Styling system

There is **no Tailwind**. `src/app/globals.css` hand-rolls Tailwind-shaped utility classes (`flex`, `gap-4`, `p-8`, `text-xl`, `text-slate-500`, `rounded-2xl`, etc.) plus project-specific classes (`premium-card`, `premium-input`, `premium-button`, `glass`, `custom-scrollbar`, `no-scrollbar`, `animate-float`, `animate-pulse-slow`, `main-container`).

When adding utility classes used in JSX, check `globals.css` first — if the class is not defined there, it does nothing. Either add the utility to `globals.css` or use inline `style={{ ... }}` (the existing code mixes both heavily).

Design tokens live in `:root`:
- `--primary` `#6366f1` (indigo) — focus mode
- `--success` `#10b981` (emerald) — short break
- `--accent` `#f43f5e` (rose)
- `--card-bg`, `--card-border`, `--glass-bg`, `--glass-border` for glassmorphism
- `--card-height: 580px`, `--card-width: 400px` — fixed dims enforced by `.premium-card`. Layout assumes all three cards share these dimensions.

Background gradient blobs in `page.tsx` use absolute positioning with `filter: blur(120px)` for the glow effect.

## Conventions

- All interactive components are `"use client"`. `page.tsx` and `layout.tsx` are server components.
- Font is Google `Outfit` loaded via `next/font` in `layout.tsx`.
- Tailwind-ish color names in JSX (`text-slate-500`, `text-indigo-400`) only work because they are defined in `globals.css`. Many shades you'd expect from Tailwind are missing — add them when needed.
- README and WALKTHROUGH list `bg-success`, `bg-indigo-500/10`, opacity modifiers, etc. — some of these are referenced in JSX but **not defined** in CSS. Treat as visual hints rather than working styles; verify in browser before relying on a class.
