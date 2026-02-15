import api from './api';
import { AttendanceTrendData, AbsenceBreakdownData, Latecomer, MonthlyStats } from '@/types/reports.types';

export const reportsService = {
    getAttendanceTrends: async (month: string, year: string) => {
        // Mock data for now if API not ready, but we'll try to hit endpoint
        // Fallback to mock if fails (for dev speed) or assume API exists as per plan instructions to "Trust files"
        // I will stick to calling the API as per plan.
        const response = await api.get<AttendanceTrendData[]>('/api/reports/attendance-trends', {
            params: { month, year }
        });
        return response.data;
    },

    getAbsenceBreakdown: async (month: string, year: string) => {
        const response = await api.get<AbsenceBreakdownData[]>('/api/reports/absence-breakdown', {
            params: { month, year }
        });
        return response.data;
    },

    getLatecomersLeaderboard: async (month: string, year: string, limit: number = 10) => {
        const response = await api.get<Latecomer[]>('/api/reports/latecomers', {
            params: { month, year, limit }
        });
        return response.data;
    },

    getMonthlyStats: async (month: string, year: string) => {
        const response = await api.get<MonthlyStats>('/api/reports/monthly-stats', {
            params: { month, year }
        });
        return response.data;
    },

    exportMonthlyReport: async (month: string, year: string) => {
        const response = await api.get('/api/reports/export', {
            params: { month, year },
            responseType: 'blob'
        });
        return response.data;
    }
};
