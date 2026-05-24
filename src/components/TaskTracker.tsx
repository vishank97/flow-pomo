"use client";

import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { AnimatePresence, Reorder, motion } from "framer-motion";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("flowstate-tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Task[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(parsed);
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("flowstate-tasks", JSON.stringify(tasks));
    }
  }, [tasks, hydrated]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks([
      { id: crypto.randomUUID(), text, completed: false },
      ...tasks,
    ]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const remove = (id: string) =>
    setTasks((ts) => ts.filter((t) => t.id !== id));

  const done = tasks.filter((t) => t.completed).length;

  return (
    <section className="tasks" aria-label="Today’s tasks">
      <div className="kicker">
        <span className="kicker__index">02</span>
        <span className="kicker__dot" />
        <span className="eyebrow">List</span>
      </div>

      <div className="tasks__head">
        <h2 className="tasks__title">Today</h2>
        <span className="tasks__count">
          {done} of {tasks.length || "—"}
        </span>
      </div>

      <form className="tasks__form" onSubmit={add}>
        <input
          className="tasks__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task…"
          aria-label="Add a task"
        />
        <button type="submit" className="tasks__add" aria-label="Add task">
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="tasks__empty">Nothing yet. Add the first thing.</p>
      ) : (
        <Reorder.Group
          axis="y"
          values={tasks}
          onReorder={setTasks}
          as="ul"
          className="tasks__list"
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                as="li"
                className="task"
                data-done={task.completed}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                whileDrag={{ scale: 1.01 }}
              >
                <button
                  type="button"
                  className="task__check"
                  data-done={task.completed}
                  onClick={() => toggle(task.id)}
                  aria-label={
                    task.completed ? "Mark as not done" : "Mark as done"
                  }
                />
                <motion.span layout className="task__text">
                  {task.text}
                </motion.span>
                <button
                  type="button"
                  className="task__del"
                  onClick={() => remove(task.id)}
                  aria-label="Delete task"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </section>
  );
}
