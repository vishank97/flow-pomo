"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

const MODE_META: Record<Mode, { label: string; copy: string }> = {
  pomodoro: {
    label: "Focus",
    copy: "Put the phone face down. Pick the one task that matters. Begin.",
  },
  shortBreak: {
    label: "Pause",
    copy: "Stand up. Walk. Look at something further than a screen.",
  },
  longBreak: {
    label: "Rest",
    copy: "Step away from the work. It will be here when you come back.",
  },
};

const DEFAULT_DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const QUICK_PICKS: Record<Mode, number[]> = {
  pomodoro: [15, 25, 45, 60, 90],
  shortBreak: [3, 5, 10],
  longBreak: [10, 15, 20, 30],
};

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

type BadgeNav = Navigator & {
  setAppBadge?: (n: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

const formatTime = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [durations, setDurations] =
    useState<Record<Mode, number>>(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hydrate durations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("flowstate-durations");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Record<Mode, number>>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDurations((prev) => ({ ...prev, ...parsed }));
        const targetMode: Mode = "pomodoro";
        if (parsed[targetMode]) {
          setTimeLeft(parsed[targetMode]!);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist durations
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("flowstate-durations", JSON.stringify(durations));
  }, [durations, hydrated]);

  // Notification permission — deferred so it never blocks the first paint.
  // requestPermission() can synchronously stall the main thread while the
  // browser prepares the permission prompt UI; scheduling it after paint
  // keeps INP healthy.
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const id = window.setTimeout(() => {
      Notification.requestPermission().catch(() => {});
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // When duration for current mode changes and timer not active, sync timeLeft
  useEffect(() => {
    if (!isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(durations[mode]);
    }
  }, [durations, mode, isActive]);

  // Countdown
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) return t - 1;

        setIsActive(false);

        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        );
        audio.volume = 0.45;
        audioRef.current = audio;
        audio.play().catch(() => {});

        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("FlowState", {
            body:
              mode === "pomodoro"
                ? "Focus session complete. Step away."
                : "Break complete. Back to work when you're ready.",
            icon: "/icon-192.png",
            tag: "flowstate-session",
          });
        }

        confetti({
          particleCount: 60,
          spread: 55,
          startVelocity: 28,
          ticks: 140,
          origin: { y: 0.35 },
          colors: ["#1b1d24", "#b4763a", "#e8e1d3"],
          scalar: 0.75,
        });

        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, mode]);

  // Tab title — closest browser equivalent to a menu-bar timer
  useEffect(() => {
    const base = "FlowState — Focus timer";
    if (isActive) {
      document.title = `${formatTime(timeLeft)} · ${MODE_META[mode].label} — FlowState`;
    } else {
      document.title = base;
    }
    return () => {
      document.title = base;
    };
  }, [timeLeft, isActive, mode]);

  // Dock / app icon badge (PWA-installed apps; harmless no-op elsewhere)
  useEffect(() => {
    const nav = navigator as BadgeNav;
    if (isActive && nav.setAppBadge) {
      nav.setAppBadge(Math.max(1, Math.ceil(timeLeft / 60))).catch(() => {});
    } else if (nav.clearAppBadge) {
      nav.clearAppBadge().catch(() => {});
    }
  }, [timeLeft, isActive]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(durations[m]);
    setIsActive(false);
  };

  const toggle = () => {
    setIsActive((a) => !a);
    // Defer permission prompt off the click's critical path so it cannot
    // block the next paint (INP). Fire only if still default after commit.
    if ("Notification" in window && Notification.permission === "default") {
      window.setTimeout(() => {
        if (Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }
      }, 0);
    }
  };

  const reset = () => {
    setTimeLeft(durations[mode]);
    setIsActive(false);
  };

  const setMinutes = (m: number) => {
    const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, m));
    const sec = clamped * 60;
    setDurations((d) => ({ ...d, [mode]: sec }));
    if (!isActive) setTimeLeft(sec);
  };

  const currentMin = Math.round(durations[mode] / 60);

  const progress = timeLeft / durations[mode];
  const C = 2 * Math.PI * 120;

  return (
    <section className="timer" aria-label="Pomodoro timer">
      <div className="kicker">
        <span className="kicker__index">01</span>
        <span className="kicker__dot" />
        <span className="eyebrow">Session</span>
      </div>

      <div className="timer__modes" role="tablist">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            data-active={mode === m}
            className="timer__mode"
            onClick={() => switchMode(m)}
          >
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      <div className="timer__duration" aria-label="Session length">
        <div className="timer__picks">
          {QUICK_PICKS[mode].map((m) => (
            <button
              key={m}
              type="button"
              className="pick"
              data-active={m === currentMin}
              onClick={() => setMinutes(m)}
              disabled={isActive}
              aria-pressed={m === currentMin}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="timer__stepper" role="group" aria-label="Custom length">
          <button
            type="button"
            onClick={() => setMinutes(currentMin - 5)}
            disabled={isActive || currentMin <= MIN_MINUTES}
            aria-label="Decrease length by 5 minutes"
          >
            <Minus size={12} strokeWidth={2} />
          </button>
          <span className="timer__stepper-value">{currentMin}m</span>
          <button
            type="button"
            onClick={() => setMinutes(currentMin + 5)}
            disabled={isActive || currentMin >= MAX_MINUTES}
            aria-label="Increase length by 5 minutes"
          >
            <Plus size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="timer__stage">
        <div className="timer__dial">
          <svg viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <motion.circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="timer__numerals">
            <AnimatePresence mode="wait">
              <motion.div
                key={timeLeft}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="timer__digits"
              >
                {formatTime(timeLeft)}
              </motion.div>
            </AnimatePresence>
            <span className="timer__label">
              {isActive ? "in session" : "ready"}
            </span>
          </div>
        </div>

        <div className="timer__sidebar">
          <h2 className="timer__title">
            {currentMin} {currentMin === 1 ? "minute" : "minutes"}.
          </h2>
          <p className="timer__caption">{MODE_META[mode].copy}</p>

          <div className="timer__controls">
            <button
              type="button"
              className="btn btn--primary"
              onClick={toggle}
              aria-label={isActive ? "Pause session" : "Start session"}
            >
              {isActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{isActive ? "Pause" : "Begin"}</span>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={reset}
              aria-label="Reset timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
