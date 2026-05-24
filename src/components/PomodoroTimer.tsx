"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

const MODES: Record<
  Mode,
  { label: string; headline: string; time: number; copy: string }
> = {
  pomodoro: {
    label: "Focus",
    headline: "Twenty-five minutes.",
    time: 25 * 60,
    copy: "Put the phone face down. Pick the one task that matters. Begin.",
  },
  shortBreak: {
    label: "Pause",
    headline: "Five minutes off.",
    time: 5 * 60,
    copy: "Stand up. Walk. Look at something further than a screen.",
  },
  longBreak: {
    label: "Rest",
    headline: "A proper break.",
    time: 15 * 60,
    copy: "Fifteen minutes away. The work will be here when you return.",
  },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.time);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("FlowState", {
            body:
              mode === "pomodoro"
                ? "Session complete. Step away."
                : "Pause complete. Return when ready.",
            icon: "/favicon.ico",
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

  const switchMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(MODES[m].time);
    setIsActive(false);
  };

  const toggle = () => {
    setIsActive((a) => !a);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const reset = () => {
    setTimeLeft(MODES[mode].time);
    setIsActive(false);
  };

  const format = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = timeLeft / MODES[mode].time;
  const C = 2 * Math.PI * 120;

  return (
    <section className="timer" aria-label="Pomodoro timer">
      <div className="kicker">
        <span className="kicker__index">01</span>
        <span className="kicker__dot" />
        <span className="eyebrow">Session</span>
      </div>

      <div className="timer__modes" role="tablist">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            data-active={mode === m}
            className="timer__mode"
            onClick={() => switchMode(m)}
          >
            {MODES[m].label}
          </button>
        ))}
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
                {format(timeLeft)}
              </motion.div>
            </AnimatePresence>
            <span className="timer__label">
              {isActive ? "in session" : "ready"}
            </span>
          </div>
        </div>

        <div className="timer__sidebar">
          <h2 className="timer__title">{MODES[mode].headline}</h2>
          <p className="timer__caption">{MODES[mode].copy}</p>

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
