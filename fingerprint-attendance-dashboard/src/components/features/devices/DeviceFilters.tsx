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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-icons-outlined text-gray-400">search</span>
                    </span>
                    <Input
                        placeholder="Search device name, IP, or serial number..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            <div className="md:w-48">
                <Select
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Locations' },
                        ...locations.map(loc => ({ value: loc, label: loc }))
                    ]}
                />
            </div>
            <div className="md:w-40">
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'online', label: 'Online' },
                        { value: 'offline', label: 'Offline' },
                        { value: 'semionline', label: 'Syncing' }
                    ]}
                />
            </div>
        </div>
    );
};
