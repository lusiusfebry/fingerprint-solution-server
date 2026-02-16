"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        // Hydration fix: set time only on client
        setTimeout(() => setCurrentTime(new Date().toLocaleTimeString()), 0);
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 bg-white dark:bg-industrial-surface/80 backdrop-blur-md border-b border-slate-200 dark:border-industrial-border flex items-center justify-between px-6 sticky top-0 z-40 transition-colors">
            {/* Global Search */}
            <div className="flex-1 max-w-lg">
                <div className="relative group">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Search device IP, employee ID or logs..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-industrial-black border-transparent rounded-lg text-slate-900 dark:text-industrial-text placeholder-slate-500 dark:placeholder-industrial-muted focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-industrial-black/50 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Server Time Display */}
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-700 dark:text-industrial-text leading-none mb-1">{currentTime}</span>
                    <span className="text-[10px] text-slate-500 dark:text-industrial-muted font-medium uppercase tracking-wider">Server Operational Time</span>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-industrial-border" />

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:text-primary dark:hover:text-industrial-text rounded-full hover:bg-slate-100 dark:hover:bg-industrial-surface transition-all"
                        title="Toggle Visual Mode"
                    >
                        <span className="material-icons-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>

                    {/* Sync Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <span className="material-icons-outlined text-lg">sync</span>
                        <span className="hidden sm:inline">Force Sync All</span>
                    </button>

                    {/* Notifications */}
                    <button class="relative p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-industrial-surface">
                        <span class="material-icons-outlined">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-industrial-black"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
