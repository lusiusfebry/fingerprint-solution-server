import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '@/services/device.service';
import { Device, CreateDeviceDto, UpdateDeviceDto } from '@/types/device.types';
import { useDeviceStatus } from './useWebSocket';
import toast from 'react-hot-toast';

export function useDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await deviceService.getDevices();
            setDevices(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch devices');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    // Real-time updates
    useDeviceStatus((updatedDevice: Device) => {
        setDevices(prevDevices =>
            prevDevices.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d)
        );
    });

    const createDevice = async (data: CreateDeviceDto) => {
        try {
            const newDevice = await deviceService.createDevice(data);
            setDevices(prev => [...prev, newDevice]);
            toast.success('Device successfully added');
            return newDevice;
        } catch (err) {
            toast.error('Failed to create device');
            throw err;
        }
    };

    const updateDevice = async (id: string, data: UpdateDeviceDto) => {
        try {
            const updatedDevice = await deviceService.updateDevice(id, data);
            setDevices(prev => prev.map(d => d.id === id ? updatedDevice : d));
            toast.success('Device successfully updated');
            return updatedDevice;
        } catch (err) {
            toast.error('Failed to update device');
            throw err;
        }
    };

    const deleteDevice = async (id: string) => {
        try {
            await deviceService.deleteDevice(id);
            setDevices(prev => prev.filter(d => d.id !== id));
            toast.success('Device successfully deleted');
        } catch (err) {
            toast.error('Failed to delete device');
            throw err;
        }
    };

    const testConnection = async (id: string) => {
        try {
            const result = await deviceService.testConnection(id);
            toast.success(result.message || 'Connection successful');
            return result;
        } catch (err) {
            toast.error('Connection failed');
            throw err;
        }
    };

    const restartDevice = async (id: string) => {
        try {
            await deviceService.restartDevice(id);
            toast.success('Device restart command sent');
        } catch (err) {
            toast.error('Failed to restart device');
            throw err;
        }
    };

    const syncDevice = async (id: string) => {
        try {
            await deviceService.syncDevice(id);
            toast.success('Device sync started');
        } catch (err) {
            toast.error('Failed to sync device');
            throw err;
        }
    };

    return {
        devices,
        loading,
        error,
        fetchDevices,
        createDevice,
        updateDevice,
        deleteDevice,
        testConnection,
        restartDevice,
        syncDevice
    };
}
