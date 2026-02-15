import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface EmployeeFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    department: string;
    onDepartmentChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    departments: string[];
    onBulkAction: (action: 'push' | 'export') => void;
    hasSelection: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
    search,
    onSearchChange,
    department,
    onDepartmentChange,
    status,
    onStatusChange,
    departments,
    onBulkAction,
    hasSelection
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-icons-outlined text-gray-400">search</span>
                    </span>
                    <Input
                        placeholder="Search by name, NIK..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            <div className="lg:w-48">
                <Select
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Departments' },
                        ...departments.map(d => ({ value: d, label: d }))
                    ]}
                />
            </div>
            <div className="lg:w-40">
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'aktif', label: 'Active' },
                        { value: 'nonaktif', label: 'Non-Active' }
                    ]}
                />
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    leftIcon={<span className="material-icons-outlined">download</span>}
                    onClick={() => onBulkAction('export')}
                >
                    Export
                </Button>
                {hasSelection && (
                    <Button
                        variant="secondary"
                        leftIcon={<span className="material-icons-outlined">cloud_upload</span>}
                        onClick={() => onBulkAction('push')}
                    >
                        Push to Devices
                    </Button>
                )}
            </div>
        </div>
    );
};
