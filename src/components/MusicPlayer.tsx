"use client";

import React, { useState, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Disc3,
} from "lucide-react";

interface Track {
  id: string;
  videoId: string;
  name: string;
  artist: string;
  type: string;
  tint: string;
}

const TRACKS: Track[] = [
  {
    id: "lofi",
    videoId: "jfKfPfyJRdk",
    name: "Lofi Study Beats",
    artist: "Lofi Girl",
    type: "Lofi",
    tint: "oklch(70% 0.10 240)",
  },
  {
    id: "synth",
    videoId: "4xDzrJKXOOY",
    name: "Synthwave Radio",
    artist: "Lofi Records",
    type: "Synthwave",
    tint: "oklch(65% 0.16 25)",
  },
  {
    id: "chillhop",
    videoId: "5yx6BWlEVcY",
    name: "Chillhop Radio",
    artist: "Chillhop Music",
    type: "Chillhop",
    tint: "oklch(75% 0.13 80)",
  },
  {
    id: "jazz",
    videoId: "kgx4WGK0oNU",
    name: "Coffee Shop Jazz",
    artist: "Ambient Café",
    type: "Jazz",
    tint: "oklch(55% 0.12 305)",
  },
];

export default function MusicPlayer() {
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<{
    playVideo: () => void;
    pauseVideo: () => void;
    setVolume: (v: number) => void;
    mute: () => void;
    unMute: () => void;
  } | null>(null);

  const track = TRACKS[trackIdx];

  const onReady: YouTubeProps["onReady"] = (e) => {
    playerRef.current = e.target;
    playerRef.current?.setVolume(volume);
    setIsLoading(false);
  };

  const onStateChange: YouTubeProps["onStateChange"] = (e) => {
    if (e.data === 1) {
      setIsPlaying(true);
      setIsLoading(false);
    } else if (e.data === 2) {
      setIsPlaying(false);
    } else if (e.data === 3) {
      setIsLoading(true);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const select = (i: number) => {
    if (i === trackIdx) return;
    setTrackIdx(i);
    setIsLoading(true);
  };

  const skip = (dir: 1 | -1) => {
    const n = (trackIdx + dir + TRACKS.length) % TRACKS.length;
    select(n);
  };

  const opts: YouTubeProps["opts"] = {
    height: "1",
    width: "1",
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      disablekb: 1,
      fs: 0,
      origin: typeof window !== "undefined" ? window.location.origin : "",
    },
  };

  return (
    <section className="radio" aria-label="Focus radio">
      {/* Hidden iframe — display:none load-bearing for Arc Auto-PiP */}
      <div className="hidden-player">
        <YouTube
          videoId={track.videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={() => setIsLoading(false)}
        />
      </div>

      <div className="radio__art" aria-hidden>
        <div className="radio__art-tint" style={{ background: track.tint }} />
        <Disc3
          size={26}
          strokeWidth={1.25}
          style={{
            animation: isPlaying
              ? "spin 14s linear infinite"
              : "none",
          }}
        />
      </div>

      <div className="radio__meta">
        <span className="radio__now">
          <span className="radio__pulse" />
          {isLoading ? "Tuning" : isPlaying ? "On air" : "Standby"}
        </span>
        <span className="radio__title">{track.name}</span>
        <span className="radio__artist">{track.artist}</span>
      </div>

      <div className="radio__stations" role="tablist" aria-label="Stations">
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            data-active={trackIdx === i}
            className="station-chip"
            onClick={() => select(i)}
          >
            {t.type}
          </button>
        ))}
      </div>

      <div className="radio__playbar">
        <button
          className="radio__btn"
          onClick={() => skip(-1)}
          aria-label="Previous station"
        >
          <SkipBack size={16} strokeWidth={1.5} />
        </button>
        <button
          className="radio__btn radio__play"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={16} strokeWidth={1.5} fill="currentColor" />
          ) : (
            <Play size={16} strokeWidth={1.5} fill="currentColor" />
          )}
        </button>
        <button
          className="radio__btn"
          onClick={() => skip(1)}
          aria-label="Next station"
        >
          <SkipForward size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="radio__vol">
        <button
          aria-label={isMuted ? "Unmute" : "Mute"}
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            if (!playerRef.current) return;
            if (next) playerRef.current.mute();
            else playerRef.current.unMute();
          }}
          className="radio__btn"
          style={{ width: 24, height: 24 }}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={14} strokeWidth={1.5} />
          ) : (
            <Volume2 size={14} strokeWidth={1.5} />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setVolume(v);
            setIsMuted(false);
            playerRef.current?.setVolume(v);
            playerRef.current?.unMute();
          }}
          className="radio__slider"
          aria-label="Volume"
        />
      </div>
    </section>
  );
}
