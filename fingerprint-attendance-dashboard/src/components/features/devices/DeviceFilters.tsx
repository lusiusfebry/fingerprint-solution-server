import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface DeviceFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    location: string;
    onLocationChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    locations: string[];
}

export const DeviceFilters: React.FC<DeviceFiltersProps> = ({
    search,
    onSearchChange,
    location,
    onLocationChange,
    status,
    onStatusChange,
    locations
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-icons-outlined text-lg">search</span>
                    </span>
                    <Input
                        placeholder="Search device, IP, or serial number..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 h-10"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:w-96">
                <Select
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                    options={[
                        { value: 'all', label: 'All Locations' },
                        ...locations.map(loc => ({ value: loc, label: loc }))
                    ]}
                />
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white text-xs h-10"
                    options={[
                        { value: 'all', label: 'All Statuses' },
                        { value: 'online', label: 'Online' },
                        { value: 'offline', label: 'Offline' },
                        { value: 'semionline', label: 'Synchronizing' }
                    ]}
                />
            </div>
        </div>
    );
};
