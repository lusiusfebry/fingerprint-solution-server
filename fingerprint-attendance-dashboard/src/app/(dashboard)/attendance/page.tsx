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
            <div className="space-y-8 py-4">
                {/* Professional Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-industrial-border pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Real-time Data Stream</h2>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Attendance Logs</h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted font-medium">
                            System Status: <span className="text-green-500 font-bold">Synchronized</span>
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => { fetchLogs(); fetchSummary(); }}
                            className="text-slate-500 dark:text-industrial-muted hover:text-primary dark:hover:text-industrial-text hover:bg-slate-100 dark:hover:bg-industrial-surface text-xs font-bold uppercase tracking-wider"
                            leftIcon={<span className="material-icons-outlined text-lg">refresh</span>}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handlePrint}
                            className="text-slate-500 dark:text-industrial-muted hover:text-primary dark:hover:text-industrial-text hover:bg-slate-100 dark:hover:bg-industrial-surface text-xs font-bold uppercase tracking-wider"
                            leftIcon={<span className="material-icons-outlined text-lg">print</span>}
                        >
                            Print Report
                        </Button>
                        <Button
                            onClick={handleExport}
                            isLoading={isExporting}
                            className="bg-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            leftIcon={<span className="material-icons-outlined text-lg">download</span>}
                        >
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* Summarized Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Present"
                        value={summary?.present_count || 0}
                        icon="how_to_reg"
                        trend={summary?.attendance_rate ? { value: `${summary.attendance_rate}% Rate`, isPositive: true } : undefined}
                        color="success"
                    />
                    <KPICard
                        title="Late"
                        value={summary?.late_count || 0}
                        icon="alarm"
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
                        icon="people"
                        color="info"
                    />
                </div>

                <div className="bg-white dark:bg-industrial-surface rounded-xl shadow-sm border border-slate-200 dark:border-industrial-border p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-outlined text-primary">search</span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Search Filters</h3>
                    </div>

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

                    <div className="pt-2">
                        <AttendanceLogTable
                            logs={logs}
                            isLoading={loading}
                            pagination={pagination}
                            onSort={handleSort}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                        />
                    </div>
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
