import axios from 'axios';
import { SystemInfo } from '../types/settings.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const systemInfoService = {
    async getSystemInfo(): Promise<SystemInfo> {
        const response = await axios.get(`${API_URL}/api/system-info`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async getHealth(): Promise<{ status: string }> {
        const response = await axios.get(`${API_URL}/api/system-info/health`);
        return response.data;
    }
};
