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
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 transition-colors duration-300">
            {/* Search Bar - Hidden on mobile or expanded */}
            <div className="flex items-center bg-gray-100 dark:bg-surface-darker rounded-full px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <span className="material-icons-outlined text-gray-400">search</span>
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
                {/* Server Time */}
                <span className="hidden md:block text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-surface-darker px-3 py-1 rounded-md">
                    {currentTime}
                </span>

                {/* Force Sync Button */}
                <button
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 transition-colors"
                    title="Force Sync All"
                >
                    <span className="material-icons-outlined">sync</span>
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 transition-colors">
                    <span className="material-icons-outlined">notifications</span>
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 transition-colors"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <span className="material-icons-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
