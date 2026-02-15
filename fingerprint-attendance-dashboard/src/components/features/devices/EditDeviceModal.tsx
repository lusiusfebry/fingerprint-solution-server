import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Device, CreateDeviceDto, UpdateDeviceDto } from '@/types/device.types';

interface EditDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateDeviceDto | UpdateDeviceDto) => Promise<void>;
    device?: Device; // If provided, edit mode. If null, create mode.
    isLoading?: boolean;
}

import { z } from 'zod';

const deviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    ip_address: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "Invalid IP Address"),
    port: z.number().int().min(1).max(65535, "Port must be 1-65535"),
    serial_number: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    comm_key: z.string().default('0')
});

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
    isOpen,
    onClose,
    onSave,
    device,
    isLoading
}) => {
    const isEdit = !!device;
    const [formData, setFormData] = useState<CreateDeviceDto>({
        name: device?.name || '',
        ip_address: device?.ip_address || '',
        port: device?.port || 4370,
        serial_number: device?.serial_number || '',
        location: device?.location || '',
        comm_key: device?.comm_key || '0'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            deviceSchema.parse(formData);
            setErrors({});
            await onSave(formData);
            onClose();
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach(e => {
                    if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
                });
                setErrors(fieldErrors);
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Device" : "Add New Device"}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Device Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Main Entrance Fingerprint"
                    helperText={errors.name}
                    className={errors.name ? "border-red-500" : ""}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="IP Address"
                        value={formData.ip_address}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        placeholder="192.168.1.201"
                        helperText={errors.ip_address}
                        className={errors.ip_address ? "border-red-500" : ""}
                    />
                    <Input
                        label="Port"
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                        placeholder="4370"
                        helperText={errors.port ? errors.port : ''}
                        className={errors.port ? "border-red-500" : ""}
                    />
                </div>
                <Input
                    label="Serial Number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Device SN"
                    readOnly={isEdit && !!formData.serial_number}
                    helperText={isEdit ? "Serial Number cannot be changed" : ""}
                />
                <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Building A, Lobby"
                    helperText={errors.location}
                    className={errors.location ? "border-red-500" : ""}
                />
                <Input
                    label="Communication Key"
                    value={formData.comm_key}
                    onChange={(e) => setFormData({ ...formData, comm_key: e.target.value })}
                    placeholder="0"
                    type="password"
                />

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex-1 text-xs text-red-500">
                        {Object.keys(errors).length > 0 && "Please fix errors before saving"}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Device'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
