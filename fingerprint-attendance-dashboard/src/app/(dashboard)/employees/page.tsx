"use client";

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEmployees } from '@/hooks/useEmployees';
import { useDevices } from '@/hooks/useDevices';
import { Button } from '@/components/ui/Button';
import { EmployeeStatsCards } from '@/components/features/employees/EmployeeStatsCards';
import { EmployeeFilters } from '@/components/features/employees/EmployeeFilters';
import { EmployeeManagementTable } from '@/components/features/employees/EmployeeManagementTable';
import { EmployeeForm } from '@/components/features/employees/EmployeeForm'; // This is a component, not a modal wrapper yet? 
// Wait, the plan says "EmployeeForm (Enhanced fields)". 
// Usually we wrap it in a Modal or use it in a separate page.
// The previous implementation used a Modal wrapper or similar?
// Let's create a wrapper modal for Add/Edit Employee right here or use a generic Modal.
import { Modal } from '@/components/ui/Modal';
import { UploadFingerprintModal } from '@/components/features/employees/UploadFingerprintModal';
import { ImportExcelModal } from '@/components/features/employees/ImportExcelModal';
import { PushToDevicesModal } from '@/components/features/employees/PushToDevicesModal';
import { EmployeeDetailDrawer } from '@/components/features/employees/EmployeeDetailDrawer';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
    const {
        employees,
        loading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        fetchEmployees
    } = useEmployees();

    const { devices } = useDevices();

    // Filters State
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Modals & Drawer State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isPushModalOpen, setIsPushModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Derived Data
    const departments = useMemo(() => {
        const depts = new Set(employees.map(e => e.departemen).filter(Boolean) as string[]);
        return Array.from(depts);
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch =
                employee.nama.toLowerCase().includes(search.toLowerCase()) ||
                employee.nik.includes(search);

            const matchesDepartment = departmentFilter === 'all' || employee.departemen === departmentFilter;
            const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

            return matchesSearch && matchesDepartment && matchesStatus;
        });
    }, [employees, search, departmentFilter, statusFilter]);

    // Handlers
    const handleAddClick = () => {
        setSelectedEmployee(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsFormModalOpen(true);
        // Close drawer if open
        setIsDrawerOpen(false);
    };

    const handleRowClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleFormSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
        setFormLoading(true);
        try {
            if (selectedEmployee) {
                await updateEmployee(selectedEmployee.id, data as UpdateEmployeeDto);
                toast.success('Employee updated successfully');
            } else {
                await createEmployee(data as CreateEmployeeDto);
                toast.success('Employee created successfully');
            }
            setIsFormModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save employee');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteClick = async (employee: Employee) => {
        if (confirm(`Are you sure you want to delete ${employee.nama}?`)) {
            await deleteEmployee(employee.id);
            setIsDrawerOpen(false);
        }
    };

    const handleToggleStatus = async (employee: Employee) => {
        const newStatus = employee.status === 'aktif' ? 'nonaktif' : 'aktif';
        try {
            await updateEmployee(employee.id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        }
    };

    const handleBulkAction = (action: 'push' | 'export') => {
        if (action === 'push') {
            setIsPushModalOpen(true);
        } else if (action === 'export') {
            // Implement export logic (maybe just a toast for now or dedicated service call)
            toast('Export feature coming soon', { icon: '🚧' });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Management</h2>
                        <p className="text-gray-500 dark:text-gray-400">Manage staff, biometrics, and access rights</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsImportModalOpen(true)}
                            leftIcon={<span className="material-icons-outlined">upload_file</span>}
                        >
                            Import Excel
                        </Button>
                        <Button
                            onClick={handleAddClick}
                            leftIcon={<span className="material-icons-outlined">add</span>}
                        >
                            Add Employee
                        </Button>
                    </div>
                </div>

                <EmployeeStatsCards employees={employees} devices={devices} loading={loading} />

                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <EmployeeFilters
                        search={search}
                        onSearchChange={setSearch}
                        department={departmentFilter}
                        onDepartmentChange={setDepartmentFilter}
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        departments={departments}
                        onBulkAction={handleBulkAction}
                        hasSelection={selectedIds.size > 0}
                    />

                    <EmployeeManagementTable
                        employees={filteredEmployees}
                        isLoading={loading}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onUploadFingerprint={(e) => {
                            setSelectedEmployee(e);
                            setIsUploadModalOpen(true);
                            setIsDrawerOpen(false);
                        }}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onToggleStatus={handleToggleStatus}
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* Add/Edit Employee Modal */}
                <Modal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
                    size="md"
                >
                    <EmployeeForm
                        key={selectedEmployee?.id || 'new'}
                        initialData={selectedEmployee}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormModalOpen(false)}
                        isLoading={formLoading}
                    />
                </Modal>

                <UploadFingerprintModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    employee={selectedEmployee || undefined}
                />

                <ImportExcelModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={fetchEmployees}
                />

                <PushToDevicesModal
                    isOpen={isPushModalOpen}
                    onClose={() => setIsPushModalOpen(false)}
                    employeeIds={Array.from(selectedIds)}
                    onSuccess={() => {
                        setSelectedIds(new Set());
                        fetchEmployees();
                    }}
                />

                <EmployeeDetailDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    employee={selectedEmployee}
                    onEdit={handleEditClick}
                />
            </div>
        </DashboardLayout>
    );
}
