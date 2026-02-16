import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Device } from '@/types/device.types';
import { Badge } from '@/components/ui/Badge';
import { DeviceActionMenu } from './DeviceActionMenu';
import { format } from 'date-fns';

interface DeviceManagementTableProps {
    devices: Device[];
    isLoading: boolean;
    onSync: (device: Device) => void;
    onRestart: (device: Device) => void;
    onTestConnection: (device: Device) => void;
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
}

export const DeviceManagementTable: React.FC<DeviceManagementTableProps> = ({
    devices,
    isLoading,
    onSync,
    onRestart,
    onTestConnection,
    onEdit,
    onDelete
}) => {
    const columns: Column<Device>[] = [
        {
            header: 'Device Name',
            accessorKey: 'name',
            cell: (device) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-industrial-black border border-slate-200 dark:border-industrial-border flex items-center justify-center">
                        <span className="material-icons-outlined text-primary text-xl">router</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{device.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-wider">SN: {device.serial_number || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            cell: (device) => (
                <div className="flex items-center text-slate-600 dark:text-industrial-muted">
                    <span className="material-icons-outlined text-sm mr-2 text-primary">place</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{device.location || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'IP Address',
            accessorKey: 'ip_address',
            cell: (device) => (
                <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-white font-bold text-xs">{device.ip_address}</span>
                    <span className="text-slate-400 dark:text-industrial-muted text-[10px] font-bold">Port {device.port}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (device) => {
                let variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' = 'error';
                let label: string = device.status.toUpperCase();

                if (device.status === 'online') variant = 'success';
                if (device.status === 'semionline') {
                    variant = 'warning';
                    label = 'SYNCING';
                }

                return (
                    <Badge
                        label={label}
                        variant={variant}
                        className="text-[9px] font-black tracking-tighter px-2 py-0.5"
                    />
                );
            }
        },
        {
            header: 'Last Sync',
            accessorKey: 'last_sync_time',
            cell: (device) => (
                <div className="flex flex-col">
                    {device.last_sync_time ? (
                        <>
                            <span className="text-slate-800 dark:text-white font-bold text-xs">{format(new Date(device.last_sync_time), 'MMM d, yyyy')}</span>
                            <span className="text-slate-400 dark:text-industrial-muted text-[10px] font-bold uppercase">{format(new Date(device.last_sync_time), 'HH:mm:ss')}</span>
                        </>
                    ) : (
                        <span className="text-slate-400 dark:text-industrial-muted italic text-[10px]">Never Synchronized</span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (device) => (
                <div className="flex justify-end">
                    <DeviceActionMenu
                        device={device}
                        onSync={onSync}
                        onRestart={onRestart}
                        onTestConnection={onTestConnection}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            )
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={devices}
            isLoading={isLoading}
            emptyMessage="No devices found. Try adding a new device or scanning the network."
        />
    );
};
