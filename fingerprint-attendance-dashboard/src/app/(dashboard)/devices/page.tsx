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
            <div className="space-y-8 py-4">
                {/* Professional Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-industrial-border pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Hardware Infrastructure</h2>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">System Terminals</h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted font-medium">
                            Status: <span className="text-green-500 font-bold">{filteredDevices.filter(d => d.status === 'online').length} Nodes Online</span>
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleSyncAll}
                            className="text-slate-500 dark:text-industrial-muted hover:text-primary dark:hover:text-industrial-text hover:bg-slate-100 dark:hover:bg-industrial-surface text-xs font-bold uppercase tracking-wider"
                            leftIcon={<span className="material-icons-outlined text-lg">sync</span>}
                        >
                            Sync All
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsAutoDetectModalOpen(true)}
                            className="text-slate-500 dark:text-industrial-muted hover:text-primary dark:hover:text-industrial-text hover:bg-slate-100 dark:hover:bg-industrial-surface text-xs font-bold uppercase tracking-wider"
                            leftIcon={<span className="material-icons-outlined text-lg">radar</span>}
                        >
                            Scan Network
                        </Button>
                        <Button
                            onClick={handleAddClick}
                            className="bg-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            leftIcon={<span className="material-icons-outlined text-lg">add</span>}
                        >
                            Add Device
                        </Button>
                    </div>
                </div>

                <DeviceStatsCards devices={devices} loading={loading} />

                <div className="bg-white dark:bg-industrial-surface rounded-xl shadow-sm border border-slate-200 dark:border-industrial-border p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-outlined text-primary">filter_list</span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">System Filters</h3>
                    </div>

                    <DeviceFilters
                        search={search}
                        onSearchChange={setSearch}
                        location={locationFilter}
                        onLocationChange={setLocationFilter}
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        locations={locations}
                    />

                    <div className="pt-2">
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
