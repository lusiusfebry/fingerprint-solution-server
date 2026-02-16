import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Device } from '@/types/device.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DeviceStatusTableProps {
    devices: Device[];
    isLoading: boolean;
    onSync: (id: string) => void;
    onRestart: (id: string) => void;
}

export const DeviceStatusTable: React.FC<DeviceStatusTableProps> = ({
    devices,
    isLoading,
    onSync,
    onRestart
}) => {
    const columns: Column<Device>[] = [
        {
            header: 'Terminal Name',
            accessorKey: 'name',
            className: 'min-w-[200px]',
            cell: (device) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{device.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-industrial-muted uppercase font-bold mt-0.5">Hardware ID: {device.id.split('-')[0]}</span>
                </div>
            )
        },
        {
            header: 'Connectivity',
            accessorKey: 'ip_address',
            cell: (device) => (
                <div className="flex items-center space-x-2">
                    <span className="material-icons-outlined text-xs text-slate-400">lan</span>
                    <span className="text-slate-600 dark:text-industrial-muted font-medium text-xs">{device.ip_address}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (device) => {
                let variant: 'success' | 'error' | 'warning' = 'error';
                if (device.status === 'online') variant = 'success';
                if (device.status === 'semionline') variant = 'warning';

                return <Badge label={device.status.toUpperCase()} variant={variant} className="text-[9px] px-2 py-0.5" />;
            }
        },
        {
            header: 'Last Seen',
            accessorKey: 'last_activity',
            cell: (device) => (
                <div className="flex items-center text-slate-500 dark:text-industrial-muted text-[10px] font-bold">
                    <span className="material-icons-outlined text-xs mr-1.5 opacity-50">schedule</span>
                    {device.last_activity ? new Date(device.last_activity).toLocaleTimeString() : 'Offline'}
                </div>
            )
        },
        {
            header: 'Quick Action',
            className: 'text-right',
            cell: (device) => (
                <div className="flex justify-end space-x-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-industrial-black rounded-full"
                        onClick={(e) => { e.stopPropagation(); onSync(device.id); }}
                        title="Sync Terminal"
                    >
                        <span className="material-icons-outlined text-sm">sync</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-industrial-black rounded-full"
                        onClick={(e) => { e.stopPropagation(); onRestart(device.id); }}
                        title="Restart Terminal"
                    >
                        <span className="material-icons-outlined text-sm">restart_alt</span>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-primary rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Terminals</h3>
                </div>
                <Link href="/devices" className="text-[10px] font-bold text-primary hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center">
                    Manage Network
                    <span className="material-icons-outlined text-sm ml-1.5 font-bold">arrow_forward</span>
                </Link>
            </div>

            <div className="bg-white dark:bg-industrial-surface rounded-2xl border border-slate-100 dark:border-industrial-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={devices.slice(0, 5)}
                    isLoading={isLoading}
                    emptyMessage="No active terminals detected."
                />
            </div>
        </div>
    );
};
