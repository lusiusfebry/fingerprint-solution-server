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
            title={isEdit ? "Edit Terminal Config" : "Register New Terminal"}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5 p-1">
                <Input
                    label="Display Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lobby Entrance"
                    helperText={errors.name}
                    className={errors.name ? "border-red-500" : "bg-slate-50 dark:bg-industrial-black"}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="IP Address"
                        value={formData.ip_address}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        placeholder="192.168.1.100"
                        helperText={errors.ip_address}
                        className={errors.ip_address ? "border-red-500" : "bg-slate-50 dark:bg-industrial-black"}
                    />
                    <Input
                        label="Network Port"
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                        placeholder="4370"
                        helperText={errors.port || ''}
                        className={errors.port ? "border-red-500" : "bg-slate-50 dark:bg-industrial-black"}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Serial Number"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                        placeholder="e.g. SN123456"
                        readOnly={isEdit && !!formData.serial_number}
                        className="bg-slate-50 dark:bg-industrial-black opacity-80"
                        helperText={isEdit ? "Hardware ID linked" : ""}
                    />
                    <Input
                        label="Deployment Zone"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Warehouse A"
                        helperText={errors.location}
                        className={errors.location ? "border-red-500" : "bg-slate-50 dark:bg-industrial-black"}
                    />
                </div>

                <Input
                    label="Security Communication Key"
                    value={formData.comm_key}
                    onChange={(e) => setFormData({ ...formData, comm_key: e.target.value })}
                    placeholder="Default: 0"
                    type="password"
                    className="bg-slate-50 dark:bg-industrial-black"
                />

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-industrial-border">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-primary hover:bg-blue-600 text-white min-w-[120px]"
                        isLoading={isLoading}
                    >
                        {isEdit ? 'Update Terminal' : 'Register Terminal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
