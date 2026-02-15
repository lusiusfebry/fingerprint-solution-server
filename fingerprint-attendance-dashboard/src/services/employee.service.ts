import api from './api';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types';

export const employeeService = {
    getEmployees: async (params?: Record<string, unknown>) => {
        const response = await api.get<Employee[]>('/api/employees', { params });
        return response.data;
    },

    getEmployee: async (id: string) => {
        const response = await api.get<Employee>(`/api/employees/${id}`);
        return response.data;
    },

    createEmployee: async (data: CreateEmployeeDto) => {
        const response = await api.post<Employee>('/api/employees', data);
        return response.data;
    },

    updateEmployee: async (id: string, data: UpdateEmployeeDto) => {
        const response = await api.patch<Employee>(`/api/employees/${id}`, data);
        return response.data;
    },

    deleteEmployee: async (id: string) => {
        await api.delete(`/api/employees/${id}`);
    },

    uploadFingerprint: async (id: string, data: { finger_index: number; template_data: string; device_id?: string }) => {
        const response = await api.post(`/api/employees/${id}/fingerprint`, data);
        return response.data;
    },

    importFromExcel: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/employees/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    pushToDevices: async (employeeIds: string[], deviceIds: string[]) => {
        const response = await api.post('/api/employees/push-to-devices', {
            employeeIds,
            deviceIds
        });
        return response.data;
    }
};
