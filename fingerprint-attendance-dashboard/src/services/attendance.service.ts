import api from './api';
import { AttendanceFilters, AttendanceLog, AttendanceSummary } from '@/types/attendance.types';

interface AttendanceLogsResponse {
    data: AttendanceLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface BackendAttendanceSummary {
    totalLogs: number;
    todayLogs: number;
    uniqueEmployeesToday: number;
    lateCount?: number;
    totalEmployees?: number;
    byDevice: { deviceId: string; deviceName: string; count: number }[];
    byVerifyType: { type: number; label: string; count: number }[];
    recentLogs: AttendanceLog[];
    dateRange: { start: string; end: string };
}

export const attendanceService = {
    getAttendanceLogs: async (filters?: AttendanceFilters) => {
        const response = await api.get<AttendanceLogsResponse>('/api/attendance/logs', { params: filters });
        const { data, total, page, totalPages } = response.data;
        return {
            data,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total
            }
        };
    },

    getAttendanceSummary: async (filters?: AttendanceFilters): Promise<AttendanceSummary> => {
        const response = await api.get<BackendAttendanceSummary>('/api/attendance/summary', { params: filters });
        const data = response.data;
        return {
            present_count: data.uniqueEmployeesToday || 0,
            late_count: data.lateCount || 0,
            absent_count: 0,
            total_expected: data.totalEmployees || 0,
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
