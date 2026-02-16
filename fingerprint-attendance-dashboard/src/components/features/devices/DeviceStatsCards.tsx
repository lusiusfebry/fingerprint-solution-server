import React, { useMemo } from 'react';
import { KPICard } from '@/components/ui/KPICard';
import { Device } from '@/types/device.types';

interface DeviceStatsCardsProps {
    devices: Device[];
    loading?: boolean;
}

export const DeviceStatsCards: React.FC<DeviceStatsCardsProps> = ({ devices, loading }) => {
    const stats = useMemo(() => {
        const total = devices.length;
        const online = devices.filter(d => d.status === 'online').length;
        const offline = devices.filter(d => d.status === 'offline').length;
        // Assuming 'semionline' or 'syncing' counts as pending sync or similar logic if needed, 
        // buy plan says "Pending Syncs". We can simulate this if we had a sync status, 
        // or just use 'semionline' as a proxy, or check 'last_sync_time'.
        // For now, let's assume 'semionline' is 'Pending Syncs' or similar unique state, 
        // or just use 0 if not explicitly tracking pending syncs count in device status.
        // Actually, backend status is 'online' | 'offline' | 'semionline'.
        const syncing = devices.filter(d => d.status === 'semionline').length;

        return { total, online, offline, syncing };
    }, [devices]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KPICard
                title="Online"
                value={stats.online}
                icon="cloud_done"
                color="success"
            />
            <KPICard
                title="Offline"
                value={stats.offline}
                icon="cloud_off"
                color="danger"
            />
            <KPICard
                title="Synchronizing"
                value={stats.syncing}
                icon="sync"
                color="info"
            />
            <KPICard
                title="Network Total"
                value={stats.total}
                icon="hub"
                color="primary"
            />
        </div>
    );
};
