import api from './api';
import { AttendanceLog, AttendanceSummary, AttendanceFilters } from '@/types/attendance.types';

export const attendanceService = {
    getAttendanceLogs: async (filters?: AttendanceFilters) => {
        const response = await api.get<any>('/api/attendance/logs', { params: filters });
        return {
            data: response.data.data,
            pagination: {
                currentPage: response.data.page,
                totalPages: response.data.totalPages,
                totalItems: response.data.total
            }
        };
    },

    getAttendanceSummary: async (filters?: AttendanceFilters) => {
        const response = await api.get<any>('/api/attendance/summary', { params: filters });
        const data = response.data;
        return {
            present_count: data.uniqueEmployeesToday || 0,
            late_count: data.lateCount || 0, // Backend return lateCount if available, checking logs
            absent_count: 0, // Placeholder
            total_expected: data.totalEmployees || 0, // We might need to fetch this separately or update backend
        };
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
