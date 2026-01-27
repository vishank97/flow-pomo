"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODES: Record<Mode, { label: string; time: number; color: string; icon: React.ReactNode }> = {
    pomodoro: { label: 'Focus', time: 25 * 60, color: 'var(--primary)', icon: <Brain size={18} /> },
    shortBreak: { label: 'Short Break', time: 5 * 60, color: 'var(--success)', icon: <Coffee size={18} /> },
    longBreak: { label: 'Long Break', time: 15 * 60, color: '#3b82f6', icon: <Timer size={18} /> },
};

export default function PomodoroTimer() {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.time);
    const [isActive, setIsActive] = useState(false);

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
        setIsActive(false);
    };

    useEffect(() => {
        // Request notification permission on mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const toggleTimer = () => {
        setIsActive(!isActive);
        // Request permission on user interaction as well (more reliable)
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const resetTimer = () => {
        setTimeLeft(MODES[mode].time);
        setIsActive(false);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);

            // Notification Sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio playback blocked by browser"));

            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("FlowState", {
                    body: mode === 'pomodoro' ? "Time's up! Take a break." : "Break's over! Let's get back to work.",
                    icon: "/favicon.ico"
                });
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [MODES[mode].color, '#ffffff']
            });
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / MODES[mode].time) * 100;

    return (
        <div className="premium-card p-8 items-center justify-between">
            <div className="w-full flex flex-col items-center gap-8">
                {/* Mode Switcher */}
                <div className="flex gap-1 p-1 glass rounded-2xl w-full" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {(Object.keys(MODES) as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                            style={{
                                background: mode === m ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: mode === m ? 'white' : '#475569',
                                boxShadow: mode === m ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                            }}
                        >
                            <span className={mode === m ? '' : 'opacity-50'}>{MODES[m].icon}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest">{MODES[m].label}</span>
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative flex items-center justify-center" style={{ width: '260px', height: '260px', marginTop: '1rem' }}>
                    <svg className="absolute" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                        <motion.circle
                            cx="130"
                            cy="130"
                            r="120"
                            fill="none"
                            stroke={MODES[mode].color}
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 120}
                            animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - progress / 100) }}
                            transition={{ type: "spring", bounce: 0, duration: 1 }}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 8px ${MODES[mode].color}44)` }}
                        />
                    </svg>

                    <div className="flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={timeLeft}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-6xl font-black tracking-tighter"
                            >
                                {formatTime(timeLeft)}
                            </motion.h2>
                        </AnimatePresence>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]" style={{ marginTop: '0.5rem' }}>
                            {isActive ? 'Keep Going' : 'Focus Session'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-8 items-center mb-4">
                <button
                    onClick={resetTimer}
                    className="glass rounded-full text-slate-500 hover:text-white transition-all hover:bg-white/5 active:scale-90"
                    style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <RotateCcw size={20} />
                </button>

                <button
                    onClick={toggleTimer}
                    className="rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{
                        background: MODES[mode].color,
                        width: '80px',
                        height: '80px',
                        boxShadow: `0 12px 36px ${MODES[mode].color}66`
                    }}
                >
                    {isActive ? <Pause size={32} fill="white" color="white" /> : <Play size={32} fill="white" color="white" style={{ marginLeft: '4px' }} />}
                </button>

                <div style={{ width: '56px' }}></div>
            </div>
        </div>
    );
}
