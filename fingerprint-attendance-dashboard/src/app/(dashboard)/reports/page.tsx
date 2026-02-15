"use client";

import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useReports } from '@/hooks/useReports';
import { AttendanceTrendChart, AbsenceBreakdownChart } from '@/components/ui/Charts';
import { LatecomersLeaderboard } from '@/components/features/reports/LatecomersLeaderboard';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
];

const YEARS = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
];

export default function ReportsPage() {
    const {
        month,
        setMonth,
        year,
        setYear,
        loading,
        trends,
        breakdown,
        leaderboard,
        stats,
        exportReport
    } = useReports();

    const [isExporting, setIsExporting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Monthly_Report_${year}_${month}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await exportReport();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `monthly_report_${year}_${month}.pdf`; // Assuming PDF/Excel
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report exported successfully');
        } catch {
            toast.error('Failed to export report');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
                        <p className="text-gray-500 dark:text-gray-400">Monthly insights and attendance performance</p>
                    </div>
                    <div className="flex space-x-3 items-center">
                        <div className="w-32">
                            <Select
                                options={MONTHS}
                                value={month.toString()}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="w-24">
                            <Select
                                options={YEARS}
                                value={year.toString()}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                            />
                        </div>
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
                            Export
                        </Button>
                    </div>
                </div>

                {/* Printable Content */}
                <div ref={printRef} className="space-y-6 p-1">
                    {/* Header for Print (Hidden on screen usually, but simple here) */}
                    <div className="hidden print:block text-center mb-6">
                        <h1 className="text-2xl font-bold">Monthly Attendance Report</h1>
                        <p className="text-gray-500">{MONTHS.find(m => m.value === month.toString())?.label} {year}</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Avg Attendance Rate"
                            value={stats?.avg_attendance_rate ? `${stats.avg_attendance_rate}%` : '0%'}
                            icon="trending_up"
                            color="info"
                        />
                        <KPICard
                            title="Total Late Arrivals"
                            value={stats?.total_late_arrivals || 0}
                            icon="timer_off"
                            color="warning"
                        />
                        <KPICard
                            title="Overtime Hours"
                            value={stats?.total_overtime_hours || 0}
                            icon="schedule"
                            color="primary"
                        />
                        <KPICard
                            title="Top Performing Dept"
                            value={stats?.top_performing_dept || '-'}
                            icon="emoji_events"
                            color="success"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-6">
                        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 print:break-inside-avoid">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Attendance Trend</h3>
                            <div className="h-[300px]">
                                {loading ? <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div> : <AttendanceTrendChart data={trends} />}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 print:break-inside-avoid">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Absence Breakdown</h3>
                            <div className="h-[300px]">
                                {loading ? <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div> : <AbsenceBreakdownChart data={breakdown} />}
                            </div>
                        </div>
                    </div>

                    {/* Latecomers Table */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 print:break-inside-avoid">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latecomers Leaderboard</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                Top 10 Employees
                            </span>
                        </div>
                        <LatecomersLeaderboard
                            data={leaderboard}
                            isLoading={loading}
                            period={`${MONTHS.find(m => m.value === month.toString())?.label} ${year}`}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
