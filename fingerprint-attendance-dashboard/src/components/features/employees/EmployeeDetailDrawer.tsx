import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Employee } from '@/types/employee.types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface EmployeeDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onEdit: (employee: Employee) => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
    isOpen,
    onClose,
    employee,
    onEdit
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!employee) return null;

    const drawerContent = (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Drawer Panel */}
            <div
                className={cn(
                    "relative w-full max-w-md bg-white dark:bg-surface-dark shadow-2xl transform transition-transform duration-300 ease-in-out h-full flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                            {employee.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{employee.nama}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{employee.nik}</p>
                            <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {employee.status === 'aktif' ? 'Active' : 'Non-Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Employment Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Department</label>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.departemen || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Position</label>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.jabatan || '-'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Biometric Data</h4>
                        <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fingerprints</span>
                                <Badge label={`${employee.fingerprint_count || 0} Registered`} variant={employee.fingerprint_count ? 'success' : 'warning'} />
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(((employee.fingerprint_count || 0) / 10) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                This user has {employee.fingerprint_count || 0} fingerprint templates synced with the system.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-surface-darker/50 flex justify-end">
                    <Button onClick={() => onEdit(employee)} leftIcon={<span className="material-icons-outlined">edit</span>}>
                        Edit Employee
                    </Button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined'
        ? createPortal(drawerContent, document.body)
        : null;
};
