"use client";

import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAttendance } from '@/hooks/useAttendance';
import { AttendanceLogTable } from '@/components/features/attendance/AttendanceLogTable';
import { AttendanceFilters } from '@/components/features/attendance/AttendanceFilters';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { PrintableAttendanceReport } from '@/components/features/attendance/PrintableAttendanceReport';

export default function AttendancePage() {
    const {
        logs,
        loading,
        summary,
        pagination,
        filters,
        setSearch,
        setStartDate,
        setEndDate,
        setDepartment,
        setDevice,
        setStatus,
        resetFilters,
        fetchLogs,
        fetchSummary,
        exportToExcel,
        handleSort
    } = useAttendance();

    const [isExporting, setIsExporting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Attendance_Report_${filters.startDate || 'all'}_${filters.endDate || 'all'}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await exportToExcel();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `attendance_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export successful');
        } catch {
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Logs</h2>
                        <p className="text-gray-500 dark:text-gray-400">Real-time attendance monitoring and history</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => { fetchLogs(); fetchSummary(); }}
                            leftIcon={<span className="material-icons-outlined">refresh</span>}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handlePrint}
                            leftIcon={<span className="material-icons-outlined">print</span>}
                        >
                            Print
                        </Button>
                        <Button
                            onClick={handleExport}
                            isLoading={isExporting}
                            leftIcon={<span className="material-icons-outlined">download</span>}
                        >
                            Export to Excel
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Present Today"
                        value={summary?.present_count || 0}
                        icon="person_check"
                        trend={summary?.attendance_rate ? { value: `${summary.attendance_rate}% Rate`, isPositive: true } : undefined}
                        color="success"
                    />
                    <KPICard
                        title="Late Arrivals"
                        value={summary?.late_count || 0}
                        icon="timer"
                        color="warning"
                    />
                    <KPICard
                        title="Absent"
                        value={summary?.absent_count || 0}
                        icon="person_off"
                        color="danger"
                    />
                    <KPICard
                        title="Total Expected"
                        value={summary?.total_expected || 0}
                        icon="groups"
                        color="info"
                    />
                </div>

                {/* Filters */}
                <AttendanceFilters
                    search={filters.search || ''}
                    onSearchChange={setSearch}
                    startDate={filters.startDate || ''}
                    onStartDateChange={setStartDate}
                    endDate={filters.endDate || ''}
                    onEndDateChange={setEndDate}
                    department={filters.department || 'all'}
                    onDepartmentChange={setDepartment}
                    device={filters.device || 'all'}
                    onDeviceChange={setDevice}
                    status={filters.status || 'all'}
                    onStatusChange={setStatus}
                    onReset={resetFilters}
                    onRefresh={() => { fetchLogs(); fetchSummary(); }}
                />

                {/* Table */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <AttendanceLogTable
                        logs={logs}
                        isLoading={loading}
                        pagination={pagination}
                        onSort={handleSort}
                        sortBy={filters.sortBy}
                        sortOrder={filters.sortOrder}
                    />
                </div>

                {/* Hidden Print Component */}
                <div style={{ display: 'none' }}>
                    <PrintableAttendanceReport
                        ref={printRef}
                        logs={logs}
                        summary={summary}
                        startDate={filters.startDate || ''}
                        endDate={filters.endDate || ''}
                        filters={filters}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
