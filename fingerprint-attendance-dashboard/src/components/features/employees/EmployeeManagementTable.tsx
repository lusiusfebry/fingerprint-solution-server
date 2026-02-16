import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Employee } from '@/types/employee.types';
import { cn } from '@/lib/utils';

interface EmployeeManagementTableProps {
    employees: Employee[];
    isLoading: boolean;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
    onUploadFingerprint: (employee: Employee) => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    onToggleStatus: (employee: Employee) => void;
    onRowClick?: (employee: Employee) => void;
}

export const EmployeeManagementTable: React.FC<EmployeeManagementTableProps> = ({
    employees,
    isLoading,
    onEdit,
    onDelete,
    onUploadFingerprint,
    selectedIds,
    onSelectionChange,
    onToggleStatus,
    onRowClick
}) => {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(new Set(employees.map(e => e.id)));
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        onSelectionChange(newSelected);
    };

    const columns: Column<Employee>[] = [
        {
            header: (
                <div className="flex items-center px-1">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 dark:border-industrial-border bg-white dark:bg-industrial-black text-primary focus:ring-primary focus:ring-offset-0"
                        checked={selectedIds.size === employees.length && employees.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                </div>
            ),
            accessorKey: 'id',
            className: 'w-12',
            cell: (employee) => (
                <div className="flex items-center px-1">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 dark:border-industrial-border bg-white dark:bg-industrial-black text-primary focus:ring-primary focus:ring-offset-0"
                        checked={selectedIds.has(employee.id)}
                        onChange={(e) => handleSelectOne(employee.id, e.target.checked)}
                    />
                </div>
            )
        },
        {
            header: 'Employee Name',
            accessorKey: 'nama',
            cell: (employee) => (
                <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-industrial-black border border-slate-200 dark:border-industrial-border flex items-center justify-center text-primary font-bold text-xs">
                        {employee.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{employee.nama}</span>
                        <span className="text-[10px] text-slate-500 dark:text-industrial-muted font-bold uppercase tracking-wider">NIK {employee.nik}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Department',
            accessorKey: 'departemen',
            cell: (employee) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wide">{employee.departemen || '-'}</span>
                    <span className="text-[10px] text-slate-500 dark:text-industrial-muted font-medium">{employee.jabatan || '-'}</span>
                </div>
            )
        },
        {
            header: 'Biometric Status',
            accessorKey: 'fingerprint_count',
            cell: (employee) => (
                <div className="flex flex-col gap-1.5 w-28">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500 dark:text-industrial-muted">Enrolled</span>
                        <span className="text-primary">{employee.fingerprint_count || 0}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-industrial-black rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${Math.min(((employee.fingerprint_count || 0) / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (employee) => (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(employee); }}
                    className={cn(
                        "relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none",
                        employee.status === 'aktif' ? "bg-green-500/20" : "bg-slate-200 dark:bg-industrial-black"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 bg-white shadow-sm",
                            employee.status === 'aktif' ? "translate-x-5.5 bg-green-500" : "translate-x-1 bg-slate-400 dark:bg-industrial-muted"
                        )}
                    />
                </button>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (employee) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUploadFingerprint(employee); }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-industrial-surface rounded-lg transition-all"
                        title="Upload Fingerprint"
                    >
                        <span className="material-icons-outlined text-xl">fingerprint</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-industrial-surface rounded-lg transition-all"
                        title="Edit Employee"
                    >
                        <span className="material-icons-outlined text-xl">edit</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(employee); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Employee"
                    >
                        <span className="material-icons-outlined text-xl">delete</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={employees}
            isLoading={isLoading}
            emptyMessage="No employees found."
            onRowClick={onRowClick}
        />
    );
};
