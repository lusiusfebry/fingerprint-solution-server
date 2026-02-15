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
}

export const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({
    logs,
    isLoading,
    pagination,
    // onSort
}) => {
    const columns: Column<AttendanceLog>[] = [
        {
            header: 'Log ID',
            accessorKey: 'log_id',
            cell: (log) => <span className="text-gray-400 text-xs font-mono">#{log.id.slice(0, 6)}</span>
        },
        {
            header: 'Date & Time',
            accessorKey: 'timestamp',
            cell: (log) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-sm font-medium">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-gray-500 text-xs">
                        {format(new Date(log.timestamp), 'hh:mm:ss a')}
                    </span>
                </div>
            )
        },
        {
            header: 'Employee',
            accessorKey: 'employee_name',
            cell: (log) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                        {log.employee_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{log.employee_name || 'Unknown'}</span>
                        <span className="text-gray-500 text-xs">{log.employee_nik || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Department',
            accessorKey: 'department',
            cell: (log) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {log.department || '-'}
                </span>
            )
        },
        {
            header: 'Device / Location',
            accessorKey: 'device_name',
            cell: (log) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-xs">{log.device_name}</span>
                    <div className="flex items-center text-gray-500 text-xs mt-0.5">
                        <span className="material-icons-outlined text-[10px] mr-1">place</span>
                        {log.device_location}
                    </div>
                </div>
            )
        },
        {
            header: 'Verification',
            accessorKey: 'verify_type',
            cell: (log) => <span className="text-gray-500 text-xs capitalize">{log.verify_type?.toLowerCase() || 'Fingerprint'}</span>
        },
        {
            header: 'Status',
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
