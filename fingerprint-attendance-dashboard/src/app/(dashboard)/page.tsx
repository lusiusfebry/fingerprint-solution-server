"use client";

import React from 'react';
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
        description: h.details || h.status,
        timestamp: new Date(h.created_at).toLocaleTimeString(),
        type: h.status === 'success' ? 'success' as const : 'error' as const
    }));

    if (authLoading) return <div className="flex items-center justify-center h-screen"><Skeleton className="w-10 h-10" variant="circular" /></div>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.username}!</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devicesLoading ? <Skeleton variant="rectangular" className="h-32" /> : (
                        <KPICard
                            title="Total Devices"
                            value={totalDevices}
                            icon="router"
                            color="primary"
                            badges={[
                                { label: `${onlineDevices} Online`, variant: 'success' },
                                { label: `${offlineDevices} Offline`, variant: 'error' }
                            ]}
                        />
                    )}

                    {employeesLoading ? <Skeleton variant="rectangular" className="h-32" /> : (
                        <KPICard
                            title="Total Employees"
                            value={totalEmployees}
                            icon="groups"
                            color="info"
                            trend={{ value: "+2 this week", isPositive: true }}
                        />
                    )}

                    {attendanceLoading ? <Skeleton variant="rectangular" className="h-32" /> : (
                        <KPICard
                            title="Today's Attendance"
                            value={`${attendanceRate}%`}
                            icon="schedule"
                            color="warning"
                            progress={{ value: presentCount, max: totalExpected, label: `${presentCount}/${totalExpected} Present` }}
                        />
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device Status Table */}
                    <div className="lg:col-span-2">
                        <DeviceStatusTable
                            devices={devices}
                            isLoading={devicesLoading}
                            onSync={syncDevice}
                            onRestart={restartDevice}
                        />
                    </div>

                    {/* Recent Activity Timeline & System Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {historyLoading ? <Skeleton variant="rectangular" rows={5} /> : (
                            <Timeline
                                items={timelineItems}
                                viewAllLink="/attendance" // Or a specific logs page
                            />
                        )}
                        <SystemInfoCard />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
