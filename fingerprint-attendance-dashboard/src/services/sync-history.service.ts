import api from './api';

export interface SyncHistory {
    id: string;
    device_id: string;
    status: 'success' | 'failure';
    details?: string;
    created_at: string;
    // Add other properties
}

export const syncHistoryService = {
    getRecentSyncs: async () => {
        const response = await api.get<SyncHistory[]>('/api/sync-history/recent'); // Assuming this endpoint exists or similar
        return response.data;
    },

    getSyncHistory: async (params?: Record<string, unknown>) => {
        const response = await api.get<SyncHistory[]>('/api/sync-history', { params });
        return response.data;
    }
};
