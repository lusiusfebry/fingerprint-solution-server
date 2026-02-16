import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { deviceService } from '@/services/device.service';
import { Device, CreateDeviceDto } from '@/types/device.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

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
    const [scanning, setScanning] = useState(false);
    const [foundDevices, setFoundDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
    const [adding, setAdding] = useState(false);

    const startScan = async () => {
        setScanning(true);
        setFoundDevices([]);
        setSelectedDevices(new Set());
        try {
            const devices = await deviceService.scanNetwork();
            setFoundDevices(devices);
            toast.success(`Found ${devices.length} devices`);
        } catch (err) {
            console.error(err);
            toast.error('Network scan failed');
        } finally {
            setScanning(false);
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
            // Error handled by parent or toast in service
        } finally {
            setAdding(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Auto-Detect System Terminals"
            size="lg"
        >
            <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-900/20">
                    <span className="material-icons-outlined text-blue-500">info</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Ensure the server and biometric devices share the same local area network subnet for discovery.
                    </p>
                </div>

                {foundDevices.length === 0 && !scanning && (
                    <div className="text-center py-16 bg-slate-50 dark:bg-industrial-black/40 rounded-2xl border border-dashed border-slate-200 dark:border-industrial-border">
                        <div className="w-16 h-16 bg-white dark:bg-industrial-surface rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="material-icons-outlined text-3xl text-slate-300">radar</span>
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">No Devices Discovered</h4>
                        <p className="text-slate-500 dark:text-industrial-muted text-sm">Initiate a network scan to search for hardware terminals.</p>
                    </div>
                )}

                {scanning && (
                    <div className="text-center py-16 bg-slate-50 dark:bg-industrial-black/40 rounded-2xl border border-dashed border-slate-200 dark:border-industrial-border">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <LoadingSpinner size="lg" className="text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Scanning Network...</h4>
                        <p className="text-slate-500 dark:text-industrial-muted text-sm">Searching subnet 192.168.1.0/24 on port 4370</p>
                    </div>
                )}

                {foundDevices.length > 0 && (
                    <div className="bg-white dark:bg-industrial-surface rounded-xl border border-slate-200 dark:border-industrial-border overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-industrial-border">
                            <thead className="bg-slate-50 dark:bg-industrial-black/50">
                                <tr>
                                    <th className="px-6 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
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
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Network Address</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Port</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Hardware ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-industrial-border/30">
                                {foundDevices.map((device) => (
                                    <tr key={device.ip_address} className="hover:bg-slate-50 dark:hover:bg-industrial-black/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                                                checked={selectedDevices.has(device.ip_address)}
                                                onChange={() => toggleSelection(device.ip_address)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white">{device.ip_address}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-industrial-muted">{device.port}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-primary">{device.serial_number || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-industrial-border">
                    <Button
                        variant="secondary"
                        onClick={startScan}
                        disabled={scanning || adding}
                        className="bg-slate-100 dark:bg-industrial-black text-slate-700 dark:text-white"
                        leftIcon={<span className="material-icons-outlined text-lg">refresh</span>}
                    >
                        {scanning ? 'Detecting...' : 'Scan Subnet'}
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={adding} className="text-slate-500">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={selectedDevices.size === 0 || adding}
                            isLoading={adding}
                            className="bg-primary hover:bg-blue-600 text-white min-w-[140px]"
                        >
                            Connect {selectedDevices.size} Terminals
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
