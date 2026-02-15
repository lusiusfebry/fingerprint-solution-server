"use client";

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDevices } from '@/hooks/useDevices';
import { Button } from '@/components/ui/Button';
import { DeviceStatsCards } from '@/components/features/devices/DeviceStatsCards';
import { DeviceFilters } from '@/components/features/devices/DeviceFilters';
import { DeviceManagementTable } from '@/components/features/devices/DeviceManagementTable';
import { EditDeviceModal } from '@/components/features/devices/EditDeviceModal';
import { AutoDetectModal } from '@/components/features/devices/AutoDetectModal';
import { Device, CreateDeviceDto, UpdateDeviceDto } from '@/types/device.types';
import toast from 'react-hot-toast';

export default function DevicesPage() {
    const {
        devices,
        loading,
        createDevice,
        updateDevice,
        deleteDevice,
        syncDevice,
        restartDevice,
        testConnection
    } = useDevices();

    // Filters State
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAutoDetectModalOpen, setIsAutoDetectModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | undefined>(undefined);
    const [actionLoading, setActionLoading] = useState(false);

    // Derived Data
    const locations = useMemo(() => {
        const locs = new Set(devices.map(d => d.location).filter(Boolean) as string[]);
        return Array.from(locs);
    }, [devices]);

    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const matchesSearch =
                device.name.toLowerCase().includes(search.toLowerCase()) ||
                device.ip_address.includes(search) ||
                (device.serial_number && device.serial_number.toLowerCase().includes(search.toLowerCase()));

            const matchesLocation = locationFilter === 'all' || device.location === locationFilter;
            const matchesStatus = statusFilter === 'all' || device.status === statusFilter;

            // Handle 'Syncing' status mapping if needed, matching DeviceFilters options
            // DeviceFilters has 'semionline' as 'Syncing'

            return matchesSearch && matchesLocation && matchesStatus;
        });
    }, [devices, search, locationFilter, statusFilter]);

    // Handlers
    const handleAddClick = () => {
        setSelectedDevice(undefined);
        setIsEditModalOpen(true);
    };

    const handleEditClick = (device: Device) => {
        setSelectedDevice(device);
        setIsEditModalOpen(true);
    };

    const handleSaveDevice = async (data: CreateDeviceDto | UpdateDeviceDto) => {
        setActionLoading(true);
        try {
            if (selectedDevice) {
                await updateDevice(selectedDevice.id, data as UpdateDeviceDto);
            } else {
                await createDevice(data as CreateDeviceDto);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = async (device: Device) => {
        if (confirm(`Are you sure you want to delete ${device.name}? This action cannot be undone.`)) {
            await deleteDevice(device.id);
        }
    };

    const handleAddDetectedDevices = async (devicesToAdd: CreateDeviceDto[]) => {
        for (const device of devicesToAdd) {
            await createDevice(device);
        }
        toast.success(`Successfully added ${devicesToAdd.length} devices`);
    };

    const handleSyncAll = async () => {
        const onlineDevices = devices.filter(d => d.status === 'online');
        if (onlineDevices.length === 0) {
            toast('No online devices to sync', { icon: 'ℹ️' });
            return;
        }

        const promises = onlineDevices.map(d => syncDevice(d.id));
        toast.promise(Promise.all(promises), {
            loading: 'Syncing all online devices...',
            success: 'Sync commands sent',
            error: 'Failed to sync some devices'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h2>
                        <p className="text-gray-500 dark:text-gray-400">Manage fingerprint terminals and connection status</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={handleSyncAll}
                            leftIcon={<span className="material-icons-outlined">sync</span>}
                        >
                            Sync All
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setIsAutoDetectModalOpen(true)}
                            leftIcon={<span className="material-icons-outlined">radar</span>}
                        >
                            Auto-Detect
                        </Button>
                        <Button
                            onClick={handleAddClick}
                            leftIcon={<span className="material-icons-outlined">add</span>}
                        >
                            Add Device
                        </Button>
                    </div>
                </div>

                <DeviceStatsCards devices={devices} loading={loading} />

                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <DeviceFilters
                        search={search}
                        onSearchChange={setSearch}
                        location={locationFilter}
                        onLocationChange={setLocationFilter}
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        locations={locations}
                    />

                    <DeviceManagementTable
                        devices={filteredDevices}
                        isLoading={loading}
                        onSync={(d) => syncDevice(d.id)}
                        onRestart={(d) => restartDevice(d.id)}
                        onTestConnection={(d) => testConnection(d.id)}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                </div>

                <EditDeviceModal
                    key={selectedDevice?.id || 'new'}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveDevice}
                    device={selectedDevice}
                    isLoading={actionLoading}
                />

                <AutoDetectModal
                    isOpen={isAutoDetectModalOpen}
                    onClose={() => setIsAutoDetectModalOpen(false)}
                    onAddDevices={handleAddDetectedDevices}
                />
            </div>
        </DashboardLayout>
    );
}
