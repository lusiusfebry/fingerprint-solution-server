import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Device } from '@/types/device.types';
import { Badge } from '@/components/ui/Badge';
import { DeviceActionMenu } from './DeviceActionMenu';

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
            header: 'Device Info',
            accessorKey: 'name',
            cell: (device) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="material-icons-outlined text-primary">fingerprint</span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{device.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">SN: {device.serial_number || '-'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            cell: (device) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                        <span className="material-icons-outlined text-xs mr-1 text-gray-400">place</span>
                        {device.location || 'Unassigned'}
                    </div>
                </div>
            )
        },
        {
            header: 'IP / Port',
            accessorKey: 'ip_address',
            cell: (device) => (
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    <div>{device.ip_address}</div>
                    <div className="text-gray-400 dark:text-gray-600">Port: {device.port}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (device) => {
                let variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' = 'error';
                let label: string = device.status;

                if (device.status === 'online') variant = 'success';
                if (device.status === 'semionline') {
                    variant = 'info';
                    label = 'Syncing';
                }

                return (
                    <div className="flex items-center">
                        <Badge label={label} variant={variant} showDot />
                        {device.status === 'semionline' && (
                            <span className="ml-2 h-2 w-2 bg-blue-400 rounded-full animate-ping opacity-75"></span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Last Sync',
            accessorKey: 'last_sync_time',
            cell: (device) => (
                <div className="text-xs text-gray-500">
                    {device.last_sync_time ? (
                        <span>{new Date(device.last_sync_time).toLocaleString()}</span>
                    ) : (
                        <span className="text-gray-400 italic">Never</span>
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
