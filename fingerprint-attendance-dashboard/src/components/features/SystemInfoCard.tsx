import React, { useEffect, useState } from 'react';
import { systemInfoService } from '@/services/system-info.service';
import { SystemInfo } from '@/types/settings.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const SystemInfoCard: React.FC = () => {
    const [info, setInfo] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchInfo = async () => {
        try {
            const data = await systemInfoService.getSystemInfo();
            setInfo(data);
        } catch (error) {
            console.error('Failed to fetch system info', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfo();
        const interval = setInterval(fetchInfo, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!info) return null;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = 2;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-surface-darker/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="material-icons-outlined mr-2 text-primary">dns</span>
                    System Status
                </h3>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${info.server_status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {info.server_status.toUpperCase()}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-surface-darker rounded-lg text-center">
                        <span className="block text-xs text-gray-500 mb-1">Uptime</span>
                        <span className="text-sm font-medium font-mono">{formatUptime(info.uptime)}</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-surface-darker rounded-lg text-center">
                        <span className="block text-xs text-gray-500 mb-1">Version</span>
                        <span className="text-sm font-medium">{info.version}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* CPU Usage could be mocked/hidden if not available */}

                    {/* Memory Usage */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Memory Usage</span>
                            <span className="font-medium">{info.memory_usage.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${info.memory_usage.percent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>Used: {formatBytes(info.memory_usage.used)}</span>
                            <span>Total: {formatBytes(info.memory_usage.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase">Database Counts</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="block text-lg font-bold text-gray-900 dark:text-white">{info.counts?.devices || 0}</span>
                            <span className="text-[10px] text-gray-500">Devices</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold text-gray-900 dark:text-white">{info.counts?.employees || 0}</span>
                            <span className="text-[10px] text-gray-500">Employees</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold text-gray-900 dark:text-white">{info.counts?.logs || 0}</span>
                            <span className="text-[10px] text-gray-500">Logs</span>
                        </div>
                    </div>
                </div>

                {info.last_backup && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                        Last Backup: {new Date(info.last_backup).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
};
