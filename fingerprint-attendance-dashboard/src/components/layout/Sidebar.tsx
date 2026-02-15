"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: 'dashboard' },
        { name: 'Device Management', path: '/devices', icon: 'router' },
        { name: 'Employee Management', path: '/employees', icon: 'people' },
        { name: 'Attendance Logs', path: '/attendance', icon: 'history' },
        { name: 'System Settings', path: '/settings', icon: 'settings' },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-darker border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                <span className="material-icons-outlined text-primary text-3xl mr-2">fingerprint</span>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">BioSync Server</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link href={item.path} className={cn(
                                    "flex items-center px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                )}>
                                    <span className={cn("material-icons-outlined mr-3", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200")}>{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile / Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role || 'Admin'}</p>
                    </div>
                    <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                        <span className="material-icons-outlined">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
