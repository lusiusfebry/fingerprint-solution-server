import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Employee } from '@/types/employee.types';
import { Button } from '@/components/ui/Button';

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
                <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedIds.size === employees.length && employees.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            accessorKey: 'id',
            className: 'w-10',
            cell: (employee) => (
                <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedIds.has(employee.id)}
                    onChange={(e) => handleSelectOne(employee.id, e.target.checked)}
                />
            )
        },
        {
            header: 'NIK / Nama',
            accessorKey: 'nama',
            cell: (employee) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
                        {employee.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{employee.nama}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{employee.nik}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Departemen',
            accessorKey: 'departemen',
            cell: (employee) => (
                <div className="text-sm">
                    <div className="text-gray-900 dark:text-gray-200">{employee.departemen || '-'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.jabatan || '-'}</div>
                </div>
            )
        },
        {
            header: 'Biometric Status',
            accessorKey: 'fingerprint_count',
            cell: (employee) => (
                <div className="flex items-center space-x-2">
                    <div className="flex-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(((employee.fingerprint_count || 0) / 10) * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{employee.fingerprint_count || 0}/10</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (employee) => (
                <button
                    onClick={() => onToggleStatus(employee)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${employee.status === 'aktif' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${employee.status === 'aktif' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (employee) => (
                <div className="flex justify-end space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUploadFingerprint(employee)}
                        title="Upload Fingerprint"
                        className="h-8 w-8 p-0"
                    >
                        <span className="material-icons-outlined text-sm">fingerprint</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        title="Edit Employee"
                        className="h-8 w-8 p-0"
                    >
                        <span className="material-icons-outlined text-sm">edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(employee)}
                        title="Delete Employee"
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <span className="material-icons-outlined text-sm">delete</span>
                    </Button>
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
