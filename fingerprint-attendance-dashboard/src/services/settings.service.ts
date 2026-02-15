import axios from 'axios';
import { SystemSettings, BackupHistory } from '../types/settings.types';
import { Pagination } from '../types/admin.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const settingsService = {
    async getSettings(): Promise<SystemSettings> {
        const response = await axios.get(`${API_URL}/api/system-settings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
        const response = await axios.put(`${API_URL}/api/system-settings`, settings, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async getBackupHistory(page = 1, limit = 10): Promise<{ data: BackupHistory[], pagination: Pagination }> {
        const response = await axios.get(`${API_URL}/api/backup/history`, {
            params: { page, limit },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async createBackup(type: 'manual' | 'auto' = 'manual'): Promise<BackupHistory> {
        const response = await axios.post(`${API_URL}/api/backup/create`, { type }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async restoreBackup(id: string): Promise<void> {
        await axios.post(`${API_URL}/api/backup/restore/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    async deleteBackup(id: string): Promise<void> {
        await axios.delete(`${API_URL}/api/backup/delete/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    async downloadBackup(id: string): Promise<Blob> {
        const response = await axios.get(`${API_URL}/api/backup/download/${id}`, {
            responseType: 'blob',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};
