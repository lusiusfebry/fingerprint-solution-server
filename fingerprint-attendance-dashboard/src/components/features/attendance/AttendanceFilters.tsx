import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useDevices } from '@/hooks/useDevices';

interface AttendanceFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    department: string;
    onDepartmentChange: (value: string) => void;
    device: string;
    onDeviceChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    onReset: () => void;
    onRefresh: () => void;
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    search,
    onSearchChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    department,
    onDepartmentChange,
    device,
    onDeviceChange,
    status,
    onStatusChange,
    onReset,
    onRefresh
}) => {
    const { devices } = useDevices();

    // Mock departments for now, ideally fetch from API
    const departments = [
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Marketing', label: 'Marketing' }
    ];

    const deviceOptions = devices.map(d => ({
        value: d.id,
        label: `${d.name} (${d.location})`
    }));

    const statusOptions = [
        { value: 'present', label: 'Present' },
        { value: 'late', label: 'Late' },
        { value: 'absent', label: 'Absent' }
    ];

    return (
        <div className="bg-white dark:bg-surface-dark p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    placeholder="Search name or NIK..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    leftIcon={<span className="material-icons-outlined">search</span>}
                />

                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                    />
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                    />
                </div>

                <Select
                    options={[{ value: 'all', label: 'All Departments' }, ...departments]}
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                />

                <Select
                    options={[{ value: 'all', label: 'All Devices' }, ...deviceOptions]}
                    value={device}
                    onChange={(e) => onDeviceChange(e.target.value)}
                />
            </div>

            <div className="flex justify-between items-center">
                <div className="w-full md:w-1/4">
                    <Select
                        options={[{ value: 'all', label: 'All Status' }, ...statusOptions]}
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                    />
                </div>
                <div className="flex space-x-2">
                    <Button variant="ghost" onClick={onReset}>
                        Reset Filters
                    </Button>
                    <Button variant="secondary" onClick={onRefresh} leftIcon={<span className="material-icons-outlined">refresh</span>}>
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    );
};
