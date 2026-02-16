"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { SystemInfoCard } from '@/components/features/SystemInfoCard';
import { DeviceStatusTable } from '@/components/features/devices/DeviceStatusTable';
import { Timeline } from '@/components/ui/Timeline';
import { useDevices } from '@/hooks/useDevices';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { devices, loading: devicesLoading, syncDevice, restartDevice } = useDevices();
    const { employees, loading: employeesLoading } = useEmployees();
    const { summary, loading: attendanceLoading } = useAttendance();
    const { history, loading: historyLoading } = useSyncHistory();

    // Derived Stats
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = totalDevices - onlineDevices;

    const totalEmployees = employees.length;
    // Assuming employee object has a status or similar, or just generic count

    // Attendance Summary
    const presentCount = summary?.present_count || 0; // Adjust based on actual API response
    const totalExpected = summary?.total_expected || totalEmployees || 1; // Avoid division by zero
    const attendanceRate = Math.round((presentCount / totalExpected) * 100);

    // Timeline Items
    const timelineItems = history.slice(0, 5).map(h => ({
        id: h.id,
        title: `Device Sync: ${h.device_id}`, // Ideally resolve device name
        description: h.error_message || h.status,
        timestamp: new Date(h.timestamp).toLocaleTimeString(),
        type: h.status === 'success' ? 'success' as const : 'error' as const
    }));

    if (authLoading) return <div className="flex items-center justify-center h-screen"><Skeleton className="w-10 h-10" variant="circular" /></div>;

    return (
        <DashboardLayout>
            <div className="space-y-8 py-6">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Operational Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted font-medium mt-1">
                            Greetings, <span className="text-primary font-bold">{user?.username}</span>. Here's what's happening today.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white dark:bg-industrial-surface border border-slate-200 dark:border-industrial-border rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">System: Balanced</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {devicesLoading ? <Skeleton variant="rectangular" className="h-40 glass-surface" /> : (
                        <KPICard
                            title="Terminal Nodes"
                            value={totalDevices}
                            icon="router"
                            color="primary"
                            badges={[
                                { label: `${onlineDevices} Active`, variant: 'success' },
                                { label: `${offlineDevices} Terminated`, variant: 'error' }
                            ]}
                        />
                    )}

                    {employeesLoading ? <Skeleton variant="rectangular" className="h-40 glass-surface" /> : (
                        <KPICard
                            title="Personnel Database"
                            value={totalEmployees}
                            icon="fingerprint"
                            color="info"
                            trend={{ value: "+2 New Ident", isPositive: true }}
                            subtitle="Total registered biometric profiles"
                        />
                    )}

                    {attendanceLoading ? <Skeleton variant="rectangular" className="h-40 glass-surface" /> : (
                        <KPICard
                            title="Today's Transmission"
                            value={`${attendanceRate}%`}
                            icon="sensors"
                            color="warning"
                            progress={{ value: presentCount, max: totalExpected, label: 'Sync Efficiency' }}
                            subtitle={`${presentCount} / ${totalExpected} Validated check-ins`}
                        />
                    )}
                </div>

                {/* Main Control Center Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Device Management Module */}
                    <div className="lg:col-span-2">
                        <DeviceStatusTable
                            devices={devices}
                            isLoading={devicesLoading}
                            onSync={syncDevice}
                            onRestart={restartDevice}
                        />
                    </div>

                    {/* Right Panel: Logs & Health */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-industrial-border/30 pb-3">
                                <h3 className="text-[10px] font-bold text-industrial-muted uppercase tracking-[0.2em]">Recent Transmissions</h3>
                                <Link href="/attendance" className="text-[8px] text-primary font-bold hover:underline tracking-widest uppercase">Inspect All</Link>
                            </div>
                            {historyLoading ? <Skeleton variant="rectangular" rows={5} className="glass-surface" /> : (
                                <Timeline
                                    items={timelineItems}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-industrial-border/30 pb-3">
                                <h3 className="text-[10px] font-bold text-industrial-muted uppercase tracking-[0.2em]">Hardware Health</h3>
                            </div>
                            <SystemInfoCard />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
