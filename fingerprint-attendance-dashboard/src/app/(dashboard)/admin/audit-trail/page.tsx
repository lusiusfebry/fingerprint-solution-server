'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { AuditLog } from '@/types/admin.types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        module: '',
        severity: '',
        startDate: '',
        endDate: ''
    });

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchLogs = React.useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const result = await adminService.getAuditLogs({
                page,
                limit: 20,
                ...filters
            });
            setLogs(result.data);
            setPagination({
                currentPage: Number(result.pagination.currentPage),
                totalPages: result.pagination.totalPages,
                totalItems: result.pagination.totalItems
            });
        } catch (_error) {
            console.error(_error);
            showToast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    // ...
    const applyFilters = () => {
        fetchLogs(1);
    };

    const resetFilters = () => {
        setFilters({ search: '', module: '', severity: '', startDate: '', endDate: '' });
        fetchLogs(1);
    };

    const handleExport = async () => {
        try {
            const blob = await adminService.exportAuditLogs('csv', { ...filters, page: 1, limit: 10000 });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString()}.csv`;
            a.click();
        } catch {
            showToast.error('Export failed');
        }
    };

    const columns: Column<AuditLog>[] = [
        // ...
        {
            header: 'Severity',
            accessorKey: 'severity',
            cell: (log) => {
                const variantMap: Record<string, 'info' | 'warning' | 'error'> = {
                    info: 'info',
                    warning: 'warning',
                    critical: 'error'
                };
                return <Badge variant={variantMap[log.severity]} label={log.severity.toUpperCase()} />;
            }
        },
        {
            header: 'User',
            accessorKey: 'user_name',
            cell: (log) => (
                <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] mr-2">
                        {log.user_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium">{log.user_name || 'System'}</span>
                </div>
            )
        },
        {
            header: 'Module',
            accessorKey: 'module',
            cell: (log) => <span className="text-xs font-mono uppercase bg-gray-100 dark:bg-surface-darker px-1 rounded">{log.module}</span>
        },
        {
            header: 'Action',
            accessorKey: 'action',
            cell: (log) => <span className="text-xs font-medium">{log.action}</span>
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (log) => <span className="text-xs text-gray-500 truncate max-w-[200px] block" title={log.description}>{log.description}</span>
        },
        {
            header: 'Details',
            cell: (log) => (
                <button onClick={() => setSelectedLog(log)} className="text-primary hover:underline text-xs">
                    View
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track system activities and security events.</p>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <span className="material-icons-outlined mr-2">download</span>
                    Export CSV
                </Button>
            </div>

            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Select
                        options={[{ value: '', label: 'All Modules' }, { value: 'auth', label: 'Auth' }, { value: 'settings', label: 'Settings' }, { value: 'users', label: 'Users' }]}
                        value={filters.module}
                        onChange={(e) => handleFilterChange('module', e.target.value)}
                    />
                    <Select
                        options={[{ value: '', label: 'All Severities' }, { value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }]}
                        value={filters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button onClick={applyFilters} className="flex-1">Apply</Button>
                        <Button onClick={resetFilters} variant="outline">Reset</Button>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={logs}
                isLoading={loading}
                pagination={{
                    ...pagination,
                    onPageChange: (page) => fetchLogs(page)
                }}
            />

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Audit Log Details"
            >
                {selectedLog && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-gray-500 text-xs">Timestamp</span>
                                <span className="font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">IP Address</span>
                                <span className="font-mono">{selectedLog.ip_address}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">User</span>
                                <span className="font-medium">{selectedLog.user_name || 'System'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">Module / Action</span>
                                <span>{selectedLog.module} / {selectedLog.action}</span>
                            </div>
                        </div>

                        <div>
                            <span className="block text-gray-500 text-xs mb-1">Description</span>
                            <div className="p-2 bg-gray-50 dark:bg-surface-darker rounded border border-gray-200 dark:border-gray-700">
                                {selectedLog.description}
                            </div>
                        </div>

                        {selectedLog.request_data && (
                            <div>
                                <span className="block text-gray-500 text-xs mb-1">Request Data</span>
                                <pre className="p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(selectedLog.request_data, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setSelectedLog(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
