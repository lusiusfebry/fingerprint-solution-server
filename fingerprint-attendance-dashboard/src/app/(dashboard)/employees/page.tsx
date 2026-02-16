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
            <div className="space-y-10 py-4">
                {/* Tactical Header: Human Resources Core */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-industrial-border/50 pb-8 relative group">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow" />
                            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] font-mono">Biometric Ident Database // Verified</h2>
                        </div>
                        <h1 className="text-4xl font-bold text-industrial-text tracking-tighter font-display">
                            Personnel Management
                        </h1>
                        <p className="text-sm text-industrial-muted flex items-center font-medium">
                            Status: <span className="text-primary ml-1.5 font-mono uppercase tracking-widest">{employees.length} Ident Profiles Encrypted</span>
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-industrial-black/40 border-industrial-border text-industrial-muted hover:text-accent-amber hover:border-accent-amber/40 text-[10px] font-bold uppercase tracking-widest h-10 px-6"
                            leftIcon={<span className="material-icons-outlined text-sm">upload_file</span>}
                        >
                            Import Data.XLS
                        </Button>
                        <Button
                            onClick={handleAddClick}
                            className="bg-primary shadow-glow text-industrial-black text-[10px] font-bold uppercase tracking-widest h-10 px-6 hover:bg-primary/90 transition-all"
                            leftIcon={<span className="material-icons-outlined text-sm">person_add</span>}
                        >
                            Register New Profile
                        </Button>
                    </div>
                </div>

                <EmployeeStatsCards employees={employees} devices={devices} loading={loading} />

                <div className="glass-surface rounded-xl shadow-industrial border border-industrial-border/40 p-8 space-y-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="material-icons-outlined text-primary text-lg">manage_search</span>
                        <h3 className="text-[10px] font-bold text-industrial-muted uppercase tracking-[0.2em]">Database Query Filters</h3>
                    </div>

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

                    <div className="pt-4">
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
