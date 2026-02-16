import React, { useEffect, useState } from 'react';
import { systemInfoService } from '@/services/system-info.service';
import { SystemInfo } from '@/types/settings.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

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
        <div className="glass-surface rounded-xl shadow-industrial overflow-hidden border border-industrial-border/40 group">
            <div className="p-5 border-b border-industrial-border/50 bg-industrial-surface/50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-industrial-text uppercase tracking-[0.2em] flex items-center">
                    <span className="material-icons-outlined mr-2 text-primary text-lg">terminal</span>
                    System Core Metrics
                </h3>
                <div className={cn(
                    "px-2 py-0.5 rounded-sm text-[10px] font-mono border flex items-center",
                    info.server_status === 'online' ? 'bg-accent-green/5 text-accent-green border-accent-green/20' : 'bg-accent-red/5 text-accent-red border-accent-red/20'
                )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full mr-2", info.server_status === 'online' ? 'bg-accent-green animate-pulse' : 'bg-accent-red')} />
                    {info.server_status.toUpperCase()}
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-industrial-black/40 border border-industrial-border rounded flex flex-col items-center group-hover:border-primary/30 transition-colors">
                        <span className="text-[9px] text-industrial-muted uppercase tracking-widest mb-2">Runtime.Pulsar</span>
                        <span className="text-xs font-mono text-primary shadow-glow">{formatUptime(info.uptime)}</span>
                    </div>
                    <div className="p-3 bg-industrial-black/40 border border-industrial-border rounded flex flex-col items-center group-hover:border-primary/30 transition-colors">
                        <span className="text-[9px] text-industrial-muted uppercase tracking-widest mb-2">Build.Node</span>
                        <span className="text-xs font-mono text-industrial-text">v{info.version}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Memory Allocation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] text-industrial-muted uppercase tracking-widest">Memory.Allocation</span>
                            <span className="font-mono text-xs text-primary">{info.memory_usage.percent}%</span>
                        </div>
                        <div className="w-full bg-industrial-black border border-industrial-border h-2 rounded-full overflow-hidden p-[1px]">
                            <div
                                className="bg-primary h-full rounded-full shadow-glow transition-all duration-1000 ease-in-out relative"
                                style={{ width: `${info.memory_usage.percent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/10 animate-[scan_2s_linear_infinite]" />
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-industrial-muted mt-1 opacity-60">
                            <span>USED // {formatBytes(info.memory_usage.used)}</span>
                            <span>TOTAL // {formatBytes(info.memory_usage.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-industrial-border/50">
                    <h4 className="text-[9px] font-bold text-industrial-muted mb-4 uppercase tracking-[0.2em]">Data.Engine Status</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-2 bg-industrial-black/20 rounded border border-transparent hover:border-primary/20 hover:bg-industrial-black/40 transition-all">
                            <span className="text-lg font-mono text-industrial-text mb-1">{info.counts?.devices?.total || 0}</span>
                            <span className="text-[8px] text-industrial-muted uppercase tracking-widest">Nodes</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-industrial-black/20 rounded border border-transparent hover:border-primary/20 hover:bg-industrial-black/40 transition-all">
                            <span className="text-lg font-mono text-industrial-text mb-1">{info.counts?.employees || 0}</span>
                            <span className="text-[8px] text-industrial-muted uppercase tracking-widest">Users</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-industrial-black/20 rounded border border-transparent hover:border-primary/20 hover:bg-industrial-black/40 transition-all">
                            <span className="text-lg font-mono text-industrial-text mb-1">{info.counts?.logs || 0}</span>
                            <span className="text-[8px] text-industrial-muted uppercase tracking-widest">Logs</span>
                        </div>
                    </div>
                </div>

                {info.last_backup && (
                    <div className="pt-4 flex items-center justify-center space-x-2 text-[9px] font-mono text-accent-amber/70 border-t border-industrial-border/20">
                        <span className="material-icons-outlined text-xs">history</span>
                        <span className="uppercase tracking-widest">Snapshot Created: {new Date(info.last_backup).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div >
    );
};
