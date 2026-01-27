import PomodoroTimer from "@/components/PomodoroTimer";
import TaskTracker from "@/components/TaskTracker";
import MusicPlayer from "@/components/MusicPlayer";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-4 gap-6" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center" style={{ marginTop: '1rem' }}>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} className="animate-pulse-slow" />
          Powered by FlowState
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
          Simplify Your Daily <br />
          <span style={{ color: 'var(--primary)' }}>Deep Work Sessions</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg" style={{ opacity: 0.8 }}>
          Professional-grade Pomodoro timer, task tracker, and immersive lofi tunes.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="main-container" style={{
        maxWidth: '1300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        gap: '2rem',
        width: '100%',
        flex: 1
      }}>
        <div className="flex justify-center scale-[0.95] origin-top">
          <PomodoroTimer />
        </div>
        <div className="flex justify-center scale-[0.95] origin-top">
          <TaskTracker />
        </div>
        <div className="flex justify-center scale-[0.95] origin-top">
          <MusicPlayer />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex gap-8 text-slate-500 text-[10px] uppercase tracking-widest font-bold" style={{ paddingBottom: '1.5rem' }}>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-success animate-pulse-slow" style={{ width: '8px', height: '8px' }}></div>
          Sync Enabled
        </div>
        <div>v1.0.0</div>
        <div className="text-indigo-400" style={{ cursor: 'pointer' }}>Documentation</div>
      </footer>

      {/* Background Decorative Elements */}
      <div className="absolute overflow-hidden" style={{ top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(120px)' }}></div>
        <div className="absolute rounded-full" style={{ bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(244, 63, 94, 0.05)', filter: 'blur(120px)' }}></div>
      </div>
    </main>
  );
}
