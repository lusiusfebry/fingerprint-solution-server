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
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-darker border-r border-slate-200 dark:border-industrial-border flex flex-col justify-between h-full transition-transform duration-300 ease-in-out">
            <div>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-industrial-border bg-white dark:bg-surface-darker/50">
                    <span className="material-icons-outlined text-primary text-3xl mr-2">fingerprint</span>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white font-display">BioSync</h1>
                        <span className="text-[10px] text-slate-500 dark:text-industrial-muted font-medium uppercase tracking-wider">Server X105D</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                                        : "text-slate-600 dark:text-industrial-muted hover:bg-slate-100 dark:hover:bg-industrial-surface hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <span className={cn(
                                    "material-icons-outlined mr-3 text-xl transition-colors",
                                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-industrial-text"
                                )}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Admin Section Divider */}
                    {(user?.role === 'Super Admin' || user?.role === 'Admin' || (user?.role as { name: string })?.name === 'Super Admin' || (user?.role as { name: string })?.name === 'Admin') && (
                        <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-[0.2em]">
                            System Core
                        </div>
                    )}

                    {(user?.role === 'Super Admin' || user?.role === 'Admin' || (user?.role as { name: string })?.name === 'Super Admin' || (user?.role as { name: string })?.name === 'Admin') && [
                        { name: 'User Management', path: '/admin/users', icon: 'admin_panel_settings' },
                        { name: 'Access Control', path: '/admin/roles', icon: 'security' },
                        { name: 'Audit Trail', path: '/admin/audit-trail', icon: 'receipt_long' }
                    ].map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "group flex items-center px-4 py-2 text-[11px] font-bold font-mono rounded-lg transition-all duration-200 uppercase tracking-wider",
                                    isActive
                                        ? "bg-primary/5 text-primary"
                                        : "text-slate-500 dark:text-industrial-muted hover:bg-slate-100 dark:hover:bg-industrial-surface hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <span className={cn(
                                    "material-icons-outlined mr-3 text-lg",
                                    isActive ? "text-primary" : "text-slate-400 dark:text-industrial-muted/60"
                                )}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sidebar Footer / User Profile */}
            <div className="p-4 border-t border-slate-200 dark:border-industrial-border bg-white dark:bg-surface-darker/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-industrial-surface transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-industrial-surface flex items-center justify-center text-primary font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user?.username || 'Admin User'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-industrial-muted truncate">
                            {typeof user?.role === 'string' ? user.role : (user?.role as { name: string })?.name || 'System Admin'}
                        </p>
                    </div>
                    <button onClick={logout} className="text-slate-400 hover:text-accent-red transition-colors" title="Logout">
                        <span className="material-icons-outlined text-lg">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
