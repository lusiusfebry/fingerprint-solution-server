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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-icons-outlined text-lg">search</span>
                    </span>
                    <Input
                        placeholder="Search employee or NIK..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 h-10"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                    />
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                    />
                </div>

                <Select
                    options={[{ value: 'all', label: 'All Departments' }, ...departments]}
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                />

                <Select
                    options={[{ value: 'all', label: 'All Devices' }, ...deviceOptions]}
                    value={device}
                    onChange={(e) => onDeviceChange(e.target.value)}
                    className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-industrial-border">
                <div className="w-full md:w-64">
                    <Select
                        options={[{ value: 'all', label: 'All Statuses' }, ...statusOptions]}
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        className="flex-1 md:flex-none text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-industrial-muted dark:hover:text-white"
                    >
                        Reset
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onRefresh}
                        className="flex-1 md:flex-none px-6 bg-slate-100 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-700 dark:text-white text-xs font-bold"
                        leftIcon={<span className="material-icons-outlined text-sm">refresh</span>}
                    >
                        Sync Logs
                    </Button>
                </div>
            </div>
        </div>
    );
};
