import React, { useMemo } from 'react';
import { KPICard } from '@/components/ui/KPICard';
import { Employee } from '@/types/employee.types';
import { Device } from '@/types/device.types';

interface EmployeeStatsCardsProps {
    employees: Employee[];
    devices: Device[];
    loading?: boolean;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({ employees, devices, loading }) => {
    const stats = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'aktif').length;
        const nonActive = total - active;

        const totalTemplates = employees.reduce((acc, curr) => acc + (curr.fingerprint_count || 0), 0);

        const onlineDevices = devices.filter(d => d.status === 'online').length;
        const totalDevices = devices.length;

        return { total, active, nonActive, totalTemplates, onlineDevices, totalDevices };
    }, [employees, devices]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <KPICard
                title="Total Staff"
                value={stats.total}
                icon="people"
                color="info"
                badges={[
                    { label: `${stats.active} Active`, variant: 'success' },
                    { label: `${stats.nonActive} Non-Active`, variant: 'neutral' }
                ]}
            />
            <KPICard
                title="Biometric Templates"
                value={stats.totalTemplates}
                icon="fingerprint"
                color="success"
                subtitle="Total registered fingerprints"
            />
            <KPICard
                title="Connected Devices"
                value={`${stats.onlineDevices}/${stats.totalDevices}`}
                icon="devices"
                color="primary"
                progress={{
                    value: stats.onlineDevices,
                    max: stats.totalDevices || 1,
                    label: 'Online Status'
                }}
            />
        </div>
    );
};
