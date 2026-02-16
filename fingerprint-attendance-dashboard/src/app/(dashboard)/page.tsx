"use client";

import React from 'react';
import Link from 'next/link';
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            System Overview
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted mt-1">
                            Welcome back, <span className="text-primary font-bold">{user?.username}</span>. Here is the daily summary.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white dark:bg-industrial-surface border border-slate-200 dark:border-industrial-border rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-white uppercase tracking-widest">Network Status: Stable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devicesLoading ? <Skeleton variant="rectangular" className="h-32 rounded-2xl" /> : (
                        <KPICard
                            title="Hardware Terminals"
                            value={totalDevices}
                            icon="hub"
                            color="primary"
                            badges={[
                                { label: `${onlineDevices} Online`, variant: 'success' },
                                { label: `${offlineDevices} Offline`, variant: 'error' }
                            ]}
                        />
                    )}

                    {employeesLoading ? <Skeleton variant="rectangular" className="h-32 rounded-2xl" /> : (
                        <KPICard
                            title="Total Personnel"
                            value={totalEmployees}
                            icon="people"
                            color="info"
                            trend={{ value: "+2 New", isPositive: true }}
                            subtitle="Registered biometric profiles"
                        />
                    )}

                    {attendanceLoading ? <Skeleton variant="rectangular" className="h-32 rounded-2xl" /> : (
                        <KPICard
                            title="Attendance Rate"
                            value={`${attendanceRate}%`}
                            icon="analytics"
                            color="warning"
                            progress={{ value: presentCount, max: totalExpected, label: 'Optimization' }}
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
                    <div className="lg:col-span-1 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-industrial-border pb-3">
                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Recent Activity</h3>
                                <Link href="/attendance" className="text-[10px] text-primary font-bold hover:underline tracking-widest uppercase">View All</Link>
                            </div>
                            {historyLoading ? <Skeleton variant="rectangular" rows={5} className="h-64 rounded-xl" /> : (
                                <Timeline
                                    items={timelineItems}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-industrial-border pb-3">
                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">System Health</h3>
                            </div>
                            <SystemInfoCard />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
