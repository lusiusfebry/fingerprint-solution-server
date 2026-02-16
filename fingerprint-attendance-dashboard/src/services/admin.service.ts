import api from './api';
import { User, Role, AuditLog, AuditLogFilters, Pagination } from '../types/admin.types';

export const adminService = {
    // Users
    async getUsers(page = 1, limit = 10, search = '', roleId = ''): Promise<User[]> {
        const response = await api.get('/api/users', {
            params: { page, limit, search, roleId }
        });
        return response.data;
    },

    async createUser(data: Record<string, unknown>): Promise<User> {
        const response = await api.post('/api/users', data);
        return response.data;
    },

    async updateUser(id: string, data: Record<string, unknown>): Promise<User> {
        const response = await api.put(`/api/users/${id}`, data);
        return response.data;
    },

    async deleteUser(id: string): Promise<void> {
        await api.delete(`/api/users/${id}`);
    },

    // Roles
    async getRoles(): Promise<Role[]> {
        const response = await api.get('/api/roles');
        return response.data;
    },

    async createRole(name: string, description: string): Promise<Role> {
        const response = await api.post('/api/roles', { name, description });
        return response.data;
    },

    async updateRole(id: string, name: string, description: string): Promise<Role> {
        const response = await api.put(`/api/roles/${id}`, { name, description });
        return response.data;
    },

    async updatePermissions(id: string, permissions: { module: string; actions: string[] }[]): Promise<Role> {
        const response = await api.put(`/api/roles/${id}/permissions`, { permissions });
        return response.data;
    },

    async deleteRole(id: string): Promise<void> {
        await api.delete(`/api/roles/${id}`);
    },

    // Audit Trail
    async getAuditLogs(filters: AuditLogFilters): Promise<{ data: AuditLog[], pagination: Pagination }> {
        const response = await api.get('/api/audit-logs', {
            params: filters
        });
        return response.data;
    },

    async exportAuditLogs(format: 'csv' | 'pdf', filters: AuditLogFilters): Promise<Blob> {
        const response = await api.get('/api/audit-logs/export', {
            params: { ...filters, format },
            responseType: 'blob'
        });
        return response.data;
    }
};
