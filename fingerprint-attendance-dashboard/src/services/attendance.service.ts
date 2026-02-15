import api from './api';
import { AttendanceLog, AttendanceSummary, AttendanceFilters } from '@/types/attendance.types';

export const attendanceService = {
    getAttendanceLogs: async (filters?: AttendanceFilters) => {
        const response = await api.get<{
            data: AttendanceLog[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
            };
        }>('/api/attendance/logs', { params: filters });
        return response.data;
    },

    getAttendanceSummary: async (filters?: AttendanceFilters) => {
        const response = await api.get<AttendanceSummary>('/api/attendance/summary', { params: filters });
        return response.data;
    },

    exportToExcel: async (filters?: AttendanceFilters) => {
        const response = await api.get('/api/attendance/export', {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    },

    getDepartments: async () => {
        const response = await api.get<string[]>('/api/attendance/departments');
        return response.data;
    }
};
