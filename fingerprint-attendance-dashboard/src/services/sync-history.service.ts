import api from './api';

export interface SyncHistory {
    id: string;
    device_id: string;
    status: 'success' | 'failed'; // fixed failed status
    sync_type: string;
    records_count: number;
    error_message?: string;
    timestamp: string;
}

export const syncHistoryService = {
    getRecentSyncs: async () => {
        const response = await api.get<SyncHistory[]>('/api/sync/history?limit=5'); // Fixed endpoint
        return response.data;
    },

    getSyncHistory: async (params?: Record<string, unknown>) => {
        const response = await api.get<SyncHistory[]>('/api/sync/history', { params });
        return response.data;
    }
};
