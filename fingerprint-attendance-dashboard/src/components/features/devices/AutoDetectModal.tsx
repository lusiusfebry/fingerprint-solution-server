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
            title="Auto-Detect Devices"
            size="lg"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p>Make sure the server is on the same local network as the fingerprint devices.</p>
                </div>

                {foundDevices.length === 0 && !scanning && (
                    <div className="text-center py-8">
                        <span className="material-icons-outlined text-4xl text-gray-300 mb-2">radar</span>
                        <p className="text-gray-500">Click &quot;Start Scan&quot; to search for devices.</p>
                    </div>
                )}

                {scanning && (
                    <div className="text-center py-8">
                        <LoadingSpinner size="lg" className="mb-2" />
                        <p className="text-gray-500">Scanning local network (192.168.1.0/24)...</p>
                    </div>
                )}

                {foundDevices.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAC / SN</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                {foundDevices.map((device) => (
                                    <tr key={device.ip_address} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={selectedDevices.has(device.ip_address)}
                                                onChange={() => toggleSelection(device.ip_address)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">{device.ip_address}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{device.port}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{device.serial_number || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        variant="secondary"
                        onClick={startScan}
                        disabled={scanning || adding}
                        leftIcon={<span className="material-icons-outlined">refresh</span>}
                    >
                        {scanning ? 'Scanning...' : 'Start Scan'}
                    </Button>
                    <div className="flex space-x-3">
                        <Button variant="ghost" onClick={onClose} disabled={adding}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={selectedDevices.size === 0 || adding}
                            isLoading={adding}
                        >
                            Add {selectedDevices.size} Devices
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
