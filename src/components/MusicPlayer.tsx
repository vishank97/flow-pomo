"use client";

import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Music,
    AlertCircle,
    SkipForward,
    SkipBack,
    RefreshCw,
    Zap,
    Coffee,
    Sun,
    Moon,
    ChevronRight,
    Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKS = [
    {
        id: 'lofi',
        videoId: 'jfKfPfyJRdk',
        name: 'Lofi Study Beats',
        artist: 'Lofi Girl',
        color: '#818cf8',
        icon: <Coffee size={20} />,
        type: 'Lofi'
    },
    {
        id: 'energetic',
        videoId: '4xDzrJKXOOY',
        name: 'Synthwave Radio',
        artist: 'Lofi Girl / Records',
        color: '#f43f5e',
        icon: <Zap size={20} />,
        type: 'Energetic'
    },
    {
        id: 'upbeat',
        videoId: '5yx6BWlEVcY', // Chillhop Music - stable stream
        name: 'Chillhop Radio',
        artist: 'Chillhop Music',
        color: '#fbbf24',
        icon: <Sun size={20} />,
        type: 'Upbeat'
    },
    {
        id: 'atmospheric',
        videoId: 'kgx4WGK0oNU', // Coffee Shop Jazz - stable stream
        name: 'Coffee Shop Jazz',
        artist: 'Ambient Cafe',
        color: '#a855f7',
        icon: <Moon size={20} />,
        type: 'Atmospheric'
    }
];

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const playerRef = useRef<any>(null);

    const currentTrack = TRACKS[currentTrackIndex];

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        playerRef.current.setVolume(volume);
        setIsLoading(false);
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        // 1: Playing, 2: Paused, 3: Buffering
        if (event.data === 1) {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
        } else if (event.data === 2) {
            setIsPlaying(false);
        } else if (event.data === 3) {
            setIsLoading(true);
        }
    };

    const onPlayerError = () => {
        setError("Connection Error");
        setIsLoading(false);
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const selectTrack = (index: number) => {
        if (index === currentTrackIndex) return;
        setCurrentTrackIndex(index);
        setIsLoading(true);
        setError(null);
    };

    const changeTrack = (direction: 'next' | 'prev') => {
        let nextIndex = direction === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
        if (nextIndex >= TRACKS.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = TRACKS.length - 1;
        selectTrack(nextIndex);
    };

    const youtubeOpts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
    };

    return (
        <div className="premium-card p-8 flex flex-col gap-6 w-full max-w-md relative overflow-hidden h-[600px]" style={{ padding: '32px' }}>
            {/* Background Glow */}
            <div
                className="absolute top-0 right-0 w-48 h-48 blur-[100px] -z-1 opacity-20 pointer-events-none"
                style={{ backgroundColor: currentTrack.color }}
            ></div>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0 mb-4 border-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-2xl bg-white/5 shadow-inner" style={{ width: '48px', height: '48px' }}>
                        <Music size={24} className="text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white leading-tight">Focus Radio</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">YouTube Stream</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isLoading ? 'WAIT' : isPlaying ? 'LIVE' : 'STANDBY'}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-5 overflow-hidden border-none outline-none">

                {/* Visualized Area or Video Thumbnail */}
                <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shrink-0 bg-black/40 shadow-xl border-none">
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    <div className="absolute inset-0 z-10">
                        <YouTube
                            videoId={currentTrack.videoId}
                            opts={youtubeOpts}
                            onReady={onPlayerReady}
                            onStateChange={onPlayerStateChange}
                            onError={onPlayerError}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="absolute bottom-4 left-6 z-30 pointer-events-none">
                        <h3 className="text-xl font-black text-white leading-tight">{currentTrack.name}</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{currentTrack.artist}</p>
                    </div>
                </div>

                {/* Station Scroll - SQUIRCLES */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar py-2">
                    {TRACKS.map((track, idx) => (
                        <button
                            key={track.id}
                            onClick={() => selectTrack(idx)}
                            className="flex items-center justify-between p-4 transition-all relative"
                            style={{
                                background: currentTrackIndex === idx ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '24px', // PROPER GENTLE SQUIRCLE
                                border: currentTrackIndex === idx ? `1.5px solid ${track.color}55` : '1.5px solid rgba(255,255,255,0.05)',
                                margin: '0 2px'
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-black/30"
                                    style={{ color: currentTrackIndex === idx ? track.color : '#475569' }}
                                >
                                    {track.icon}
                                </div>
                                <div className="text-left">
                                    <p className={`text-[12px] font-black uppercase tracking-widest ${currentTrackIndex === idx ? 'text-white' : 'text-slate-500'}`}>
                                        {track.type}
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase">{track.name}</p>
                                </div>
                            </div>

                            {currentTrackIndex === idx && isPlaying && (
                                <div className="flex gap-1 items-end h-4 mr-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-white/40 rounded-full animate-pulse"
                                            style={{ height: `${8 + i * 4}px` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* FOOTER - CENTERED AND SPACED */}
            <div className="flex flex-col gap-6 shrink-0 pt-6 pb-4 bg-black/10 mt-auto">
                {/* Playback Row - Center Aligned */}
                <div className="flex items-center justify-center gap-14 w-full">
                    <button
                        onClick={() => changeTrack('prev')}
                        className="text-slate-600 hover:text-white transition-all active:scale-90"
                    >
                        <SkipBack size={32} />
                    </button>

                    <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className="w-20 h-20 rounded-[28px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
                        style={{
                            backgroundColor: currentTrack.color,
                            boxShadow: `0 12px 40px ${currentTrack.color}55`
                        }}
                    >
                        {isLoading ? (
                            <RefreshCw size={32} className="text-white animate-spin" />
                        ) : isPlaying ? (
                            <Pause size={36} fill="white" color="white" />
                        ) : (
                            <Play size={36} fill="white" color="white" className="ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => changeTrack('next')}
                        className="text-slate-600 hover:text-white transition-all active:scale-90"
                    >
                        <SkipForward size={32} />
                    </button>
                </div>

                {/* Volume - Centered and Spaced */}
                <div className="px-8">
                    <div className="flex items-center gap-4 bg-black/30 px-6 py-4 rounded-[24px] border border-white/5 w-full transition-all hover:bg-black/40">
                        <button
                            onClick={() => {
                                const newMuted = !isMuted;
                                setIsMuted(newMuted);
                                if (playerRef.current) {
                                    if (newMuted) playerRef.current.mute();
                                    else playerRef.current.unMute();
                                }
                            }}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div className="relative flex-1 flex items-center h-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setVolume(val);
                                    setIsMuted(false);
                                    if (playerRef.current) {
                                        playerRef.current.setVolume(val);
                                        playerRef.current.unMute();
                                    }
                                }}
                                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                                style={{
                                    WebkitAppearance: 'none',
                                    background: `linear-gradient(to right, ${currentTrack.color}cc ${volume}%, rgba(255,255,255,0.05) ${volume}%)`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
