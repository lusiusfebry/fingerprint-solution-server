import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '@/services/employee.service';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types';
import { useWebSocket } from '@/contexts/WebSocketContext';
import toast from 'react-hot-toast';

export function useEmployees(initialFilters?: Record<string, unknown>) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useWebSocket();

    const fetchEmployees = useCallback(async (filters?: Record<string, unknown>) => {
        try {
            setLoading(true);
            const data = await employeeService.getEmployees(filters || initialFilters);
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch employees');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [initialFilters]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        if (!socket) return;

        const handleCreated = (newEmployee: Employee) => {
            setEmployees(prev => [...prev, newEmployee]);
            toast.success(`New employee added: ${newEmployee.nama}`, { position: 'bottom-right' });
        };

        const handleUpdated = (updatedEmployee: Employee) => {
            setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
            toast('Employee updated', { icon: 'ℹ️', position: 'bottom-right' });
        };

        const handleDeleted = (id: string) => {
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast('Employee deleted', { icon: '🗑️', position: 'bottom-right' });
        };

        socket.on('employee:created', handleCreated);
        socket.on('employee:updated', handleUpdated);
        socket.on('employee:deleted', handleDeleted);

        return () => {
            socket.off('employee:created', handleCreated);
            socket.off('employee:updated', handleUpdated);
            socket.off('employee:deleted', handleDeleted);
        };
    }, [socket]);

    const createEmployee = async (data: CreateEmployeeDto) => {
        try {
            const newEmployee = await employeeService.createEmployee(data);
            // Optimistic update or wait for socket? 
            // Better to update local state immediately for better UX, socket will confirm or duplicate handling needs care.
            // If socket emits back to sender, we might get duplicate if we add here AND listen.
            // Usually we assume socket broadcasts to OTHERS, or we verify ID.
            // For simplicity, let's update here and if socket comes, we replace (or if same ID, map handles it).
            // But 'created' appends. So we might get duplicate.
            // To avoid duplicates, we can check ID.
            setEmployees(prev => {
                if (prev.find(e => e.id === newEmployee.id)) return prev;
                return [...prev, newEmployee];
            });
            toast.success('Employee successfully added');
            return newEmployee;
        } catch (err) {
            toast.error('Failed to create employee');
            throw err;
        }
    };

    const updateEmployee = async (id: string, data: UpdateEmployeeDto) => {
        try {
            const updatedEmployee = await employeeService.updateEmployee(id, data);
            setEmployees(prev => prev.map(e => e.id === id ? updatedEmployee : e));
            toast.success('Employee successfully updated');
            return updatedEmployee;
        } catch (err) {
            toast.error('Failed to update employee');
            throw err;
        }
    };

    const deleteEmployee = async (id: string) => {
        try {
            await employeeService.deleteEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee successfully deleted');
        } catch (err) {
            toast.error('Failed to delete employee');
            throw err;
        }
    };

    return {
        employees,
        loading,
        error,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee
    };
}
