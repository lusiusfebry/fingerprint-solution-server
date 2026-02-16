"use client";

import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { AttendanceLog } from '@/types/attendance.types';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface AttendanceLogTableProps {
    logs: AttendanceLog[];
    isLoading: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        onPageChange: (page: number) => void;
    };
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({
    logs,
    isLoading,
    pagination,
    onSort,
    sortBy,
    sortOrder
}) => {
    const renderHeader = (label: string, key: string) => (
        <div
            className="flex items-center cursor-pointer hover:text-primary transition-colors"
            onClick={() => onSort?.(key, sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc')}
        >
            {label}
            <span className="ml-1 material-icons-outlined text-[10px] text-gray-400">
                {sortBy === key ? (sortOrder === 'asc' ? 'north' : 'south') : 'unfold_more'}
            </span>
        </div>
    );

    const columns: Column<AttendanceLog>[] = [
        {
            header: renderHeader('Log ID', 'id'),
            accessorKey: 'log_id',
            cell: (log) => <span className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-wider">#{log.id.slice(0, 8)}</span>
        },
        {
            header: renderHeader('Timestamp', 'timestamp'),
            accessorKey: 'timestamp',
            cell: (log) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-white">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                </div>
            )
        },
        {
            header: renderHeader('Employee', 'employee_name'),
            accessorKey: 'employee_name',
            cell: (log) => (
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-industrial-black border border-slate-200 dark:border-industrial-border flex items-center justify-center text-primary font-bold text-xs">
                        {log.employee_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{log.employee_name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-500 dark:text-industrial-muted font-bold uppercase tracking-wider">NIK {log.employee_nik || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Department',
            accessorKey: 'department',
            cell: (log) => (
                <span className="text-[10px] font-bold text-slate-600 dark:text-industrial-muted uppercase tracking-wider bg-slate-100 dark:bg-industrial-black/40 px-2 py-0.5 rounded">
                    {log.department || '-'}
                </span>
            )
        },
        {
            header: 'Device',
            accessorKey: 'device_name',
            cell: (log) => (
                <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-white font-bold text-xs tracking-tight">{log.device_name}</span>
                    <div className="flex items-center text-slate-400 dark:text-industrial-muted text-[10px] font-bold uppercase mt-0.5">
                        <span className="material-icons-outlined text-[12px] mr-1">place</span>
                        {log.device_location || 'Remote'}
                    </div>
                </div>
            )
        },
        {
            header: 'Method',
            accessorKey: 'verify_type',
            cell: (log) => <span className="text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">{log.verify_type || 'Biometric'}</span>
        },
        {
            header: renderHeader('Status', 'status'),
            accessorKey: 'status',
            cell: (log) => {
                const status = log.status || 'present';
                const variantMap: Record<string, 'success' | 'warning' | 'error'> = {
                    present: 'success',
                    late: 'warning',
                    absent: 'error'
                };
                return (
                    <Badge
                        label={status.toUpperCase()}
                        variant={variantMap[status] || 'neutral'}
                        className="text-[9px] font-black tracking-tighter px-2 py-0.5"
                    />
                );
            }
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={logs}
            isLoading={isLoading}
            pagination={pagination}
            emptyMessage="No attendance logs found matching your filters."
        />
    );
};
