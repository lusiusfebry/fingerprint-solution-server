"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAttendance } from '@/hooks/useAttendance';
import { AttendanceLogTable } from '@/components/features/attendance/AttendanceLogTable';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPICard';
import { attendanceService } from '@/services/attendance.service';
import { toast } from 'react-hot-toast';

export default function AttendancePage() {
    const { logs, loading, summary, fetchLogs } = useAttendance();

    const handleExport = async () => {
        try {
            const blob = await attendanceService.exportToExcel();
            // Create download link
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance_logs.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export successful');
        } catch (error) {
            console.error(error);
            toast.error('Export failed');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Logs</h2>
                        <p className="text-gray-500 dark:text-gray-400">View and export attendance records</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchLogs()}
                            leftIcon={<span className="material-icons-outlined text-sm">refresh</span>}
                        >
                            Refresh
                        </Button>
                        <Button
                            onClick={handleExport}
                            leftIcon={<span className="material-icons-outlined text-sm">download</span>}
                        >
                            Export to Excel
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md://grid-cols-3 gap-6">
                    <KPICard
                        title="Present Today"
                        value={(summary?.present_count as number) || 0}
                        icon="check_circle"
                        color="success"
                    />
                    <KPICard
                        title="Late Arrivals"
                        value={(summary?.late_count as number) || 0}
                        icon="access_time"
                        color="warning"
                    />
                    <KPICard
                        title="Absent"
                        value={(summary?.absent_count as number) || 0}
                        icon="cancel"
                        color="danger"
                    />
                </div>

                <AttendanceLogTable
                    logs={logs}
                    isLoading={loading}
                />
            </div>
        </DashboardLayout>
    );
}
