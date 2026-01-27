# FlowState: Pomodoro & Task Tracker

FlowState is a high-performance, premium web application built with **Next.js 15**, **TypeScript**, and **Framer Motion**. It combines a focused Pomodoro timer with a drag-and-drop task tracker to help you achieve deep work.

## Features

- **Pomodoro Timer**: Three modes (Focus, Short Break, Long Break) with a visual progress indicator.
- **Task Tracker**: persistent task management with drag-and-drop reordering.
- **Glassmorphic UI**: Beautiful, modern aesthetic with smooth animations and transitions.
- **Local Persistence**: Tasks are saved to your browser's local storage automatically.
- **Responsive Design**: Works perfectly on mobile and desktop.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS with a custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Effects**: Canvas Confetti for task/timer completion

## Getting Started

The application is currently running at [http://localhost:3002](http://localhost:3002).

To run it manually:
```bash
npm install
npm run dev
```

## Structure

- `/src/app`: Application routes and global styles.
- `/src/components`: Reusable UI components (Timer, TaskTracker).
- `/src/app/globals.css`: Core design system and glassmorphism utilities.
