'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { AuditLog, AuditLogFilters } from '@/types/admin.types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

const MODULES = ['auth', 'users', 'roles', 'employees', 'devices', 'attendance', 'settings', 'system'];
const SEVERITIES = ['info', 'warning', 'critical'];

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // Filters
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        limit: 20,
        search: '',
        module: '',
        severity: '',
        startDate: '',
        endDate: ''
    });

    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.getAuditLogs(filters);
            setLogs(result.data);
            setPagination({
                currentPage: Number(result.pagination.currentPage),
                totalPages: result.pagination.totalPages,
                totalItems: result.pagination.totalItems
            });
        } catch {
            showToast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        setIsExporting(true);
        try {
            const blob = await adminService.exportAuditLogs(format, filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-trail-${new Date().toISOString()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast.success(`Exported as ${format.toUpperCase()}`);
        } catch {
            showToast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<AuditLog>[] = [
        {
            header: 'Time',
            accessorKey: 'timestamp',
            cell: (log) => (
                <div className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                </div>
            )
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            cell: (log) => (
                <Badge
                    label={log.severity.toUpperCase()}
                    variant={log.severity === 'critical' ? 'error' : log.severity === 'warning' ? 'warning' : 'info'}
                />
            )
        },
        {
            header: 'User',
            accessorKey: 'user_name',
            cell: (log) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {log.user?.name || log.user_name || 'System'}
                </div>
            )
        },
        {
            header: 'Action',
            accessorKey: 'action',
            cell: (log) => (
                <div>
                    <span className="font-medium text-primary">{log.action}</span>
                    <span className="text-xs text-gray-400 mx-1">•</span>
                    <span className="text-xs text-gray-500 capitalize">{log.module}</span>
                </div>
            )
        },
        {
            header: 'Description',
            accessorKey: 'description',
            className: 'max-w-xs truncate'
        },
        {
            header: 'IP Address',
            accessorKey: 'ip_address',
            className: 'text-xs font-mono text-gray-500'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track system activities and security events.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('csv')} isLoading={isExporting}>
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')} isLoading={isExporting}>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    placeholder="Search logs..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    leftIcon={<span className="material-icons-outlined">search</span>}
                />
                <Select
                    options={[{ value: '', label: 'All Modules' }, ...MODULES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))]}
                    value={filters.module}
                    onChange={(e) => handleFilterChange('module', e.target.value)}
                />
                <Select
                    options={[{ value: '', label: 'All Severities' }, ...SEVERITIES.map(s => ({ value: s, label: s.toUpperCase() }))]}
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                />
                <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    placeholder="Start Date"
                />
            </div>

            <DataTable
                columns={columns}
                data={logs}
                isLoading={loading}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalItems,
                    onPageChange: handlePageChange
                }}
            />
        </div>
    );
}
