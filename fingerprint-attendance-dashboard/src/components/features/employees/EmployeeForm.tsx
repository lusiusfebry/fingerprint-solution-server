"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types';

interface EmployeeFormProps {
    initialData?: Employee | null;
    onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

import { z } from 'zod';

const employeeSchema = z.object({
    nik: z.string().min(3, "NIK must be at least 3 characters").max(20, "NIK must be at most 20 characters"),
    nama: z.string().min(2, "Name must be at least 2 characters"),
    departemen: z.string().optional(),
    jabatan: z.string().optional(),
    status: z.enum(['aktif', 'nonaktif'])
});

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState<CreateEmployeeDto>({
        nama: initialData?.nama || '',
        nik: initialData?.nik || '',
        departemen: initialData?.departemen || '',
        jabatan: initialData?.jabatan || '',
        status: initialData?.status || 'aktif'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            employeeSchema.parse(formData);
            setErrors({});
            await onSubmit(formData);
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="NIK"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="e.g. 2023001"
                    disabled={isEdit} // NIK identification usually shouldn't change
                    helperText={errors.nik}
                    className={errors.nik ? "border-red-500" : ""}
                />
                <Input
                    label="Nama Lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Full Name"
                    helperText={errors.nama}
                    className={errors.nama ? "border-red-500" : ""}
                />
            </div>

            <Input
                label="Departemen"
                value={formData.departemen}
                onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                placeholder="e.g. IT, HR, Operation"
                helperText={errors.departemen}
                className={errors.departemen ? "border-red-500" : ""}
            />

            <Input
                label="Jabatan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                placeholder="e.g. Staff, Manager"
                helperText={errors.jabatan}
                className={errors.jabatan ? "border-red-500" : ""}
            />

            <Select
                label="Status Employee"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                options={[
                    { value: 'aktif', label: 'Aktif' },
                    { value: 'nonaktif', label: 'Non-Aktif' }
                ]}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {isEdit ? 'Update Employee' : 'Add Employee'}
                </Button>
            </div>
        </form>
    );
};
