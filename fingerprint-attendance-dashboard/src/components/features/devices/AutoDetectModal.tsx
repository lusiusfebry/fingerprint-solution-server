import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { deviceService } from '@/services/device.service';
import { Device, CreateDeviceDto } from '@/types/device.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AutoDetectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddDevices: (devices: CreateDeviceDto[]) => Promise<void>;
}

export const AutoDetectModal: React.FC<AutoDetectModalProps> = ({
    isOpen,
    onClose,
    onAddDevices
}) => {
    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
    const [scanning, setScanning] = useState(false);
    const [foundDevices, setFoundDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
    const [adding, setAdding] = useState(false);
    const [subnet, setSubnet] = useState('192.168.1.0/24');

    // Manual Entry State
    const [manualIp, setManualIp] = useState('');
    const [manualPort, setManualPort] = useState(4370);
    const [testingManual, setTestingManual] = useState(false);

    const startScan = async () => {
        setScanning(true);
        setFoundDevices([]);
        setSelectedDevices(new Set());
        try {
            const devices = await deviceService.scanNetwork(subnet);
            setFoundDevices(devices);
            toast.success(`Found ${devices.length} devices`);
        } catch (error) {
            console.error(error);
            toast.error('Network scan failed');
        } finally {
            setScanning(false);
        }
    };

    const handleTestManual = async () => {
        if (!manualIp) {
            toast.error('Please enter an IP address');
            return;
        }

        setTestingManual(true);
        try {
            const result = await deviceService.testConnectionByParams(manualIp, manualPort);
            if (result.success) {
                toast.success('Connection successful');
                // Auto-add to found devices if not already there or just prepared to add
                const newDevice: Device = {
                    id: 'temp-' + Date.now(),
                    name: `Manual Device (${manualIp})`,
                    ip_address: manualIp,
                    port: manualPort,
                    status: 'online',
                    serial_number: (result as { success: boolean, message: string, data?: { serial_number: string } }).data?.serial_number || 'UNKNOWN',
                    location: '',
                    comm_key: '0'
                };

                // Add to found devices if not already there
                if (!foundDevices.find(d => d.ip_address === manualIp)) {
                    setFoundDevices([...foundDevices, newDevice]);
                    setSelectedDevices(new Set([...Array.from(selectedDevices), manualIp]));
                }
            } else {
                toast.error('Connection failed: ' + result.message);
            }
        } catch (error) {
            console.error('Manual connection test failed:', error);
            toast.error('Failed to test connection');
        } finally {
            setTestingManual(false);
        }
    };

    const toggleSelection = (ip: string) => {
        const newSelected = new Set(selectedDevices);
        if (newSelected.has(ip)) {
            newSelected.delete(ip);
        } else {
            newSelected.add(ip);
        }
        setSelectedDevices(newSelected);
    };

    const handleAdd = async () => {
        const devicesToAdd = foundDevices
            .filter(d => selectedDevices.has(d.ip_address))
            .map(d => ({
                name: d.name || `Device ${d.ip_address}`,
                ip_address: d.ip_address,
                port: d.port,
                serial_number: d.serial_number || '',
                location: '',
                comm_key: '0'
            }));

        if (devicesToAdd.length === 0) return;

        setAdding(true);
        try {
            await onAddDevices(devicesToAdd);
            onClose();
            setFoundDevices([]);
            setSelectedDevices(new Set());
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hardware Discovery Center"
            size="lg"
        >
            <div className="space-y-6">
                {/* Custom Tabs */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-industrial-black/50 rounded-xl border border-slate-200 dark:border-industrial-border w-fit">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                            activeTab === 'scan'
                                ? "bg-white dark:bg-industrial-surface text-primary shadow-sm"
                                : "text-slate-500 dark:text-industrial-muted hover:text-slate-700 dark:hover:text-industrial-text"
                        )}
                    >
                        <span className="material-icons-outlined text-sm">radar</span>
                        Network Scan
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                            activeTab === 'manual'
                                ? "bg-white dark:bg-industrial-surface text-primary shadow-sm"
                                : "text-slate-500 dark:text-industrial-muted hover:text-slate-700 dark:hover:text-industrial-text"
                        )}
                    >
                        <span className="material-icons-outlined text-sm">terminal</span>
                        Manual Entry
                    </button>
                </div>

                {activeTab === 'scan' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-900/20">
                        <span className="material-icons-outlined text-blue-500">info</span>
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-3">
                                Automated device discovery within your local network infrastructure.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-[240px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-sm text-blue-400">lan</span>
                                    <input
                                        type="text"
                                        value={subnet}
                                        onChange={(e) => setSubnet(e.target.value)}
                                        placeholder="Subnet (e.g. 192.168.1.0/24)"
                                        className="w-full bg-white dark:bg-industrial-black/50 border border-blue-200 dark:border-blue-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={startScan}
                                    disabled={scanning || adding}
                                    className="text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary/5"
                                    leftIcon={scanning ? <LoadingSpinner size="sm" /> : <span className="material-icons-outlined text-sm">refresh</span>}
                                >
                                    {scanning ? 'Detecting...' : 'Scan Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-industrial-black/20 p-5 rounded-xl border border-slate-200 dark:border-industrial-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest px-1">Host/IP Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-base text-slate-400">dns</span>
                                    <input
                                        type="text"
                                        value={manualIp}
                                        onChange={(e) => setManualIp(e.target.value)}
                                        placeholder="192.168.1.100"
                                        className="w-full bg-white dark:bg-industrial-black border border-slate-200 dark:border-industrial-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 dark:text-industrial-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest px-1">Network Port</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-base text-slate-400">settings_ethernet</span>
                                    <input
                                        type="number"
                                        value={manualPort}
                                        onChange={(e) => setManualPort(parseInt(e.target.value) || 0)}
                                        className="w-full bg-white dark:bg-industrial-black border border-slate-200 dark:border-industrial-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 dark:text-industrial-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-industrial-border/40 flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={handleTestManual}
                                isLoading={testingManual}
                                disabled={!manualIp || adding}
                                className="text-xs font-bold uppercase tracking-wider"
                                leftIcon={<span className="material-icons-outlined text-sm">connectivity_active</span>}
                            >
                                Test & Prepare
                            </Button>
                        </div>
                    </div>
                )}

                {foundDevices.length === 0 && !scanning && activeTab === 'scan' && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-industrial-black/40 rounded-2xl border border-dashed border-slate-200 dark:border-industrial-border">
                        <div className="w-16 h-16 bg-white dark:bg-industrial-surface rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="material-icons-outlined text-3xl text-slate-300">radar</span>
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">No Devices Discovered</h4>
                        <p className="text-slate-500 dark:text-industrial-muted text-sm">Initiate a network scan to search for hardware terminals.</p>
                    </div>
                )}

                {scanning && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-industrial-black/40 rounded-2xl border border-dashed border-slate-200 dark:border-industrial-border">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <LoadingSpinner size="lg" className="text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Scanning Infrastructure...</h4>
                        <p className="text-slate-500 dark:text-industrial-muted text-sm font-mono uppercase tracking-widest">Searching {subnet} @ 4370</p>
                    </div>
                )}

                {foundDevices.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-[0.2em]">Discovered Nodes ({foundDevices.length})</h4>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{selectedDevices.size} Selected</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-white dark:bg-industrial-surface rounded-xl border border-slate-200 dark:border-industrial-border shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-industrial-border">
                                <thead className="bg-slate-50 dark:bg-industrial-black/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedDevices(new Set(foundDevices.map(d => d.ip_address)));
                                                    } else {
                                                        setSelectedDevices(new Set());
                                                    }
                                                }}
                                                checked={selectedDevices.size === foundDevices.length && foundDevices.length > 0}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Network Identity</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Port</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest text-right">Hardware Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-industrial-border/30">
                                    {foundDevices.map((device) => (
                                        <tr key={device.ip_address} className="hover:bg-slate-50 dark:hover:bg-industrial-black/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                    checked={selectedDevices.has(device.ip_address)}
                                                    onChange={() => toggleSelection(device.ip_address)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-white">{device.ip_address}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">NODE_HOST_INFRA</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-industrial-muted">{device.port}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-primary/20">
                                                    {device.serial_number || 'UNKNOWN_HW_ID'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-industrial-border">
                    <p className="text-[10px] text-slate-400 dark:text-industrial-muted font-bold uppercase tracking-widest">
                        Discovery protocol: <span className="text-primary">TCP/IP INTERFACE</span>
                    </p>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={adding} className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={selectedDevices.size === 0 || adding}
                            isLoading={adding}
                            className="bg-primary hover:bg-blue-600 text-white min-w-[160px] text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                        >
                            Connect {selectedDevices.size} Infrastructure
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
