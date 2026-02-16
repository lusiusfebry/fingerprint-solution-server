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
            header: 'Device Module',
            accessorKey: 'name',
            className: 'min-w-[200px]',
            cell: (device) => (
                <div className="flex flex-col">
                    <span className="font-bold text-primary tracking-wide text-sm">{device.name}</span>
                    <span className="text-[10px] text-industrial-muted uppercase font-mono mt-0.5">ID: {device.id.split('-')[0]}</span>
                </div>
            )
        },
        {
            header: 'Network.Path',
            accessorKey: 'ip_address',
            cell: (device) => (
                <div className="flex items-center space-x-2">
                    <span className="material-icons-outlined text-xs text-industrial-muted">lan</span>
                    <span className="text-industrial-text font-mono text-xs">{device.ip_address}:{device.port}</span>
                </div>
            )
        },
        {
            header: 'Node.Status',
            accessorKey: 'status',
            cell: (device) => {
                let variant: 'success' | 'error' | 'warning' = 'error';
                if (device.status === 'online') variant = 'success';
                if (device.status === 'semionline') variant = 'warning';

                return <Badge label={device.status.toUpperCase()} variant={variant} className="font-mono text-[9px] px-2 py-0" showDot />;
            }
        },
        {
            header: 'Last Transmission',
            accessorKey: 'last_activity',
            cell: (device) => (
                <div className="flex items-center text-industrial-muted text-[10px] font-mono">
                    <span className="material-icons-outlined text-xs mr-1.5 opacity-50">schedule</span>
                    {device.last_activity ? new Date(device.last_activity).toLocaleTimeString() : 'OFFLINE'}
                </div>
            )
        },
        {
            header: 'Override',
            className: 'text-right',
            cell: (device) => (
                <div className="flex justify-end space-x-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-industrial-muted hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20"
                        onClick={(e) => { e.stopPropagation(); onSync(device.id); }}
                        title="Force Transmission Sync"
                    >
                        <span className="material-icons-outlined text-sm">sync</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-industrial-muted hover:text-accent-amber hover:bg-accent-amber/10 border border-transparent hover:border-accent-amber/20"
                        onClick={(e) => { e.stopPropagation(); onRestart(device.id); }}
                        title="Reboot Module"
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
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Active Terminal Nodes</h3>
                </div>
                <Link href="/devices" className="text-xs font-bold text-primary hover:text-blue-600 transition-colors uppercase tracking-wider flex items-center">
                    Manage All Devices
                    <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={devices.slice(0, 5)}
                isLoading={isLoading}
                emptyMessage="No active terminal nodes found."
            />
        </div>
    );
};
