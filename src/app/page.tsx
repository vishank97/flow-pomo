import PomodoroTimer from "@/components/PomodoroTimer";
import TaskTracker from "@/components/TaskTracker";
import MusicPlayer from "@/components/MusicPlayer";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const today = formatDate(new Date());
  return (
    <div className="shell">
      <header className="masthead">
        <span className="masthead__left">Vol. 01 / Iss. 01</span>
        <span className="masthead__mark">
          Flow<span>state</span>
        </span>
        <span className="masthead__right">{today}</span>
      </header>

      <main className="composition">
        <PomodoroTimer />
        <TaskTracker />
      </main>

      <footer>
        <MusicPlayer />
      </footer>
    </div>
  );
}
