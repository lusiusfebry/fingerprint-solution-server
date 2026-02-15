"use client";

import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Employee } from '@/types/employee.types';
import { Button } from '@/components/ui/Button';

interface EmployeeTableProps {
    employees: Employee[];
    isLoading: boolean;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => void;
    onUploadFingerprint: (id: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
    employees,
    isLoading,
    onEdit,
    onDelete,
    onUploadFingerprint
}) => {
    const columns: Column<Employee>[] = [
        {
            header: 'Name',
            accessorKey: 'nama',
            cell: (employee) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                        {employee.nama.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{employee.nama}</span>
                </div>
            )
        },
        {
            header: 'Fingerprints',
            cell: () => (
                <span className="text-gray-500 text-xs">
                    {/* Placeholder for fingerprint count if available */}
                    -
                </span>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (employee) => (
                <div className="flex justify-end space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onUploadFingerprint(employee.id); }}
                        title="Upload Fingerprint"
                    >
                        <span className="material-icons-outlined text-sm">fingerprint</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
                        title="Edit"
                    >
                        <span className="material-icons-outlined text-sm">edit</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }}
                        title="Delete"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
            // pagination={{...}} // Implement pagination if needed
            emptyMessage="No employees found."
        />
    );
};
