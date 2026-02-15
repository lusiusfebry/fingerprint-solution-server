import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { deviceService } from '@/services/device.service';
import { employeeService } from '@/services/employee.service';
import { Device } from '@/types/device.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface PushToDevicesModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeIds: string[];
    onSuccess: () => void;
}

export const PushToDevicesModal: React.FC<PushToDevicesModalProps> = ({
    isOpen,
    onClose,
    employeeIds,
    onSuccess
}) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [pushing, setPushing] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            fetchDevices();
        }
    }, [isOpen]);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await deviceService.getDevices();
            setDevices(data);
            // Auto-select online devices
            const onlineIds = new Set(data.filter(d => d.status === 'online').map(d => d.id));
            setSelectedDevices(onlineIds);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const handlePush = async () => {
        if (selectedDevices.size === 0) return;

        setPushing(true);
        try {
            await employeeService.pushToDevices(
                employeeIds,
                Array.from(selectedDevices)
            );
            toast.success('Push command sent to selected devices');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to push templates');
        } finally {
            setPushing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Push Templates (${employeeIds.length} employees)`}
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Select target devices to push user data and fingerprint templates.
                </p>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={selectedDevices.size === devices.length && devices.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDevices(new Set(devices.map(d => d.id)));
                                                } else {
                                                    setSelectedDevices(new Set());
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                {devices.map((device) => (
                                    <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={selectedDevices.has(device.id)}
                                                onChange={(e) => {
                                                    const newSet = new Set(selectedDevices);
                                                    if (e.target.checked) newSet.add(device.id);
                                                    else newSet.delete(device.id);
                                                    setSelectedDevices(newSet);
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                                            <div className="font-medium">{device.name}</div>
                                            <div className="text-xs text-gray-500">{device.ip_address}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {device.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={onClose} disabled={pushing}>
                        Cancel
                    </Button>
                    <Button onClick={handlePush} isLoading={pushing} disabled={selectedDevices.size === 0 || pushing}>
                        Push to {selectedDevices.size} Devices
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
