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
            header: 'Device Name',
            accessorKey: 'name',
            className: 'min-w-[150px]',
            cell: (device) => <span className="font-medium text-gray-900 dark:text-white">{device.name}</span>
        },
        {
            header: 'IP Address',
            accessorKey: 'ip_address',
            cell: (device) => <span className="text-gray-500 font-mono text-xs">{device.ip_address}:{device.port}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (device) => {
                let variant: 'success' | 'error' | 'warning' = 'error';
                if (device.status === 'online') variant = 'success';
                if (device.status === 'semionline') variant = 'warning';

                return <Badge label={device.status} variant={variant} showDot />;
            }
        },
        {
            header: 'Last Activity',
            accessorKey: 'last_activity',
            cell: (device) => (
                <span className="text-gray-500 text-xs">
                    {device.last_activity ? new Date(device.last_activity).toLocaleString() : 'Never'}
                </span>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (device) => (
                <div className="flex justify-end space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onSync(device.id); }}
                        title="Sync"
                    >
                        <span className="material-icons-outlined text-sm">sync</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onRestart(device.id); }}
                        title="Restart"
                    >
                        <span className="material-icons-outlined text-sm">restart_alt</span>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Status</h3>
                <Link href="/devices" className="text-sm text-primary hover:text-primary/80 font-medium">
                    View All
                </Link>
            </div>
            <DataTable
                columns={columns}
                data={devices.slice(0, 5)} // Show only top 5
                isLoading={isLoading}
                emptyMessage="No devices found."
            />
        </div>
    );
};
