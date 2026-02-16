"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-industrial-surface p-6 rounded-xl border border-slate-200 dark:border-industrial-border shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-industrial-border">
                    <span className="material-icons-outlined text-primary">account_circle</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Identity Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="NIK / Employee ID"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        placeholder="e.g. 20230001"
                        disabled={isEdit}
                        error={errors.nik}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white"
                        labelClassName="text-[11px] font-extrabold text-slate-500 dark:text-industrial-muted uppercase tracking-wider mb-1.5"
                    />
                    <Input
                        label="Full Name"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="John Doe"
                        error={errors.nama}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white"
                        labelClassName="text-[11px] font-extrabold text-slate-500 dark:text-industrial-muted uppercase tracking-wider mb-1.5"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-industrial-surface p-6 rounded-xl border border-slate-200 dark:border-industrial-border shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-industrial-border">
                    <span className="material-icons-outlined text-primary">business</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Employment Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Department"
                        value={formData.departemen}
                        onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                        placeholder="e.g. Engineering"
                        error={errors.departemen}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white"
                        labelClassName="text-[11px] font-extrabold text-slate-500 dark:text-industrial-muted uppercase tracking-wider mb-1.5"
                    />
                    <Input
                        label="Position"
                        value={formData.jabatan}
                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                        placeholder="e.g. Senior Developer"
                        error={errors.jabatan}
                        className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white"
                        labelClassName="text-[11px] font-extrabold text-slate-500 dark:text-industrial-muted uppercase tracking-wider mb-1.5"
                    />
                </div>

                <Select
                    label="Employment Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                    className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border text-slate-900 dark:text-white h-10"
                    labelClassName="text-[11px] font-extrabold text-slate-500 dark:text-industrial-muted uppercase tracking-wider mb-1.5"
                    options={[
                        { value: 'aktif', label: 'Active Personnel' },
                        { value: 'nonaktif', label: 'Inactive / Suspended' }
                    ]}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 text-xs font-bold text-slate-500 dark:text-industrial-muted hover:text-slate-900 dark:hover:text-white"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="bg-primary hover:bg-blue-600 text-white text-xs font-extrabold px-8 h-10 rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                    {isEdit ? 'Update Employee' : 'Create Employee'}
                </Button>
            </div>
        </form>
    );
};
