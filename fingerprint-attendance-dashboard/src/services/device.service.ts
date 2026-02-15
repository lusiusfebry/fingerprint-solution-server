import api from './api';
import { Device, CreateDeviceDto, UpdateDeviceDto } from '@/types/device.types';

export const deviceService = {
    getDevices: async () => {
        const response = await api.get<Device[]>('/api/devices');
        return response.data;
    },

    getDeviceById: async (id: string) => {
        const response = await api.get<Device>(`/api/devices/${id}`);
        return response.data;
    },

    createDevice: async (data: CreateDeviceDto) => {
        const response = await api.post<Device>('/api/devices', data);
        return response.data;
    },

    updateDevice: async (id: string, data: UpdateDeviceDto) => {
        const response = await api.put<Device>(`/api/devices/${id}`, data);
        return response.data;
    },

    deleteDevice: async (id: string) => {
        await api.delete(`/api/devices/${id}`);
    },

    testConnection: async (id: string) => {
        const response = await api.post<{ success: boolean; message: string }>(`/api/devices/${id}/test`);
        return response.data;
    },

    restartDevice: async (id: string) => {
        const response = await api.post(`/api/devices/${id}/restart`);
        return response.data;
    },

    syncDevice: async (id: string) => {
        const response = await api.post(`/api/devices/${id}/sync`);
        return response.data;
    },

    scanNetwork: async () => {
        const response = await api.post<Device[]>('/api/devices/scan');
        return response.data;
    }
};
