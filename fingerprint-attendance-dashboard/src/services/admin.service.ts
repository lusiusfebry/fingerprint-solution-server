import axios from 'axios';
import { User, Role, AuditLog, AuditLogFilters, Pagination } from '../types/admin.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const adminService = {
    // Users
    async getUsers(page = 1, limit = 10, search = '', roleId = ''): Promise<User[]> {
        const response = await axios.get(`${API_URL}/api/users`, {
            params: { page, limit, search, roleId },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async createUser(data: Partial<User>): Promise<User> {
        const response = await axios.post(`${API_URL}/api/users`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const response = await axios.put(`${API_URL}/api/users/${id}`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async deleteUser(id: string): Promise<void> {
        await axios.delete(`${API_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    // Roles
    async getRoles(): Promise<Role[]> {
        const response = await axios.get(`${API_URL}/api/roles`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async createRole(name: string, description: string): Promise<Role> {
        const response = await axios.post(`${API_URL}/api/roles`, { name, description }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async updateRole(id: string, name: string, description: string): Promise<Role> {
        const response = await axios.put(`${API_URL}/api/roles/${id}`, { name, description }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async updatePermissions(id: string, permissions: { module: string; actions: string[] }[]): Promise<Role> {
        const response = await axios.put(`${API_URL}/api/roles/${id}/permissions`, { permissions }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async deleteRole(id: string): Promise<void> {
        await axios.delete(`${API_URL}/api/roles/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    // Audit Trail
    async getAuditLogs(filters: AuditLogFilters): Promise<{ data: AuditLog[], pagination: Pagination }> {
        const response = await axios.get(`${API_URL}/api/audit-logs`, {
            params: filters,
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async exportAuditLogs(format: 'csv' | 'pdf', filters: AuditLogFilters): Promise<Blob> {
        const response = await axios.get(`${API_URL}/api/audit-logs/export`, {
            params: { ...filters, format },
            responseType: 'blob',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};
