"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, GpSign as DragHandle } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export default function TaskTracker() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState('');

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('flowstate-tasks');
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('flowstate-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTasks([{ id: Date.now().toString(), text: input, completed: false }, ...tasks]);
        setInput('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div className="premium-card p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                        <CheckCircle2 size={20} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Today's Focus</h2>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5">
                    {completedCount}/{tasks.length} Done
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={addTask} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What's your focus?"
                    className="premium-input flex-1"
                />
                <button type="submit" className="premium-button px-4">
                    <Plus size={24} />
                </button>
            </form>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {tasks.map((task) => (
                            <Reorder.Item
                                key={task.id}
                                value={task}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group glass p-4 rounded-2xl flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.04] transition-colors"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`transition-colors ${task.completed ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`}
                                >
                                    {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                </button>

                                <span className={`flex-1 font-medium transition-all ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {task.text}
                                </span>

                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-400 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600 opacity-50 py-12">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Add your first task</p>
                    </div>
                )}
            </div>
        </div>
    );
}
