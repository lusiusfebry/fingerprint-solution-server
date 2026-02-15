'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Role } from '@/types/admin.types';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';

const MODULES = [
    { id: 'devices', label: 'Device Management' },
    { id: 'employees', label: 'Employee Management' },
    { id: 'attendance', label: 'Attendance Logs' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'settings', label: 'System Settings' },
    { id: 'users', label: 'User Management' },
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export'];

export default function RolesPermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [activeRole, setActiveRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

    // Permissions State: { module: { view: true, edit: false } }
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
    const [saving, setSaving] = useState(false);

    // Create Role Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');

    const fetchRoles = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getRoles();
            setRoles(data);
            if (data.length > 0 && !activeRole) {
                setActiveRole(data[0]);
            }
        } catch {
            showToast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, [activeRole]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        if (activeRole) {
            // Transform permission array to object map
            const permMap: Record<string, Record<string, boolean>> = {};
            MODULES.forEach(m => {
                permMap[m.id] = {};
                ACTIONS.forEach(a => permMap[m.id][a] = false);
            });

            activeRole.permissions.forEach(p => {
                if (!permMap[p.module]) permMap[p.module] = {};
                permMap[p.module][p.action] = true;
            });
            setPermissions(permMap);
        }
    }, [activeRole]);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createRole(newRoleName, newRoleDesc);
            showToast.success('Role created');
            setIsCreateOpen(false);
            setNewRoleName('');
            setNewRoleDesc('');
            fetchRoles();
        } catch {
            showToast.error('Failed to create role');
        }
    };

    const handlePermissionChange = (module: string, action: string, checked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: checked
            }
        }));
    };

    const handleSelectAll = (module: string, checked: boolean) => {
        const newModulePerms = { ...permissions[module] };
        ACTIONS.forEach(a => newModulePerms[a] = checked);
        setPermissions(prev => ({
            ...prev,
            [module]: newModulePerms
        }));
    };

    const handleSavePermissions = async () => {
        if (!activeRole) return;
        setSaving(true);
        try {
            // Transform map back to array
            const permsArray: { module: string, actions: string[] }[] = [];
            Object.entries(permissions).forEach(([module, actions]) => {
                const activeActions = Object.entries(actions)
                    .filter(([, isActive]) => isActive)
                    .map(([action]) => action);

                if (activeActions.length > 0) {
                    permsArray.push({ module, actions: activeActions });
                }
            });

            const updatedRole = await adminService.updatePermissions(activeRole.id, permsArray);

            // Update local state
            setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
            setActiveRole(updatedRole);
            showToast.success('Permissions updated');
        } catch {
            showToast.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!activeRole) return;
        if (!confirm(`Delete role "${activeRole.name}"?`)) return;
        try {
            await adminService.deleteRole(activeRole.id);
            showToast.success('Role deleted');
            fetchRoles(); // Will reset active role
        } catch {
            showToast.error('Failed to delete role');
        }
    };

    if (loading && roles.length === 0) return <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar List */}
            <div className="w-full md:w-72 flex-shrink-0 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900 dark:text-white">User Roles</h2>
                    <Badge>{roles.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeRole?.id === role.id
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker'
                                }`}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" className="w-full" onClick={() => setIsCreateOpen(true)}>
                        <span className="material-icons-outlined mr-2">add</span>
                        Add New Role
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {activeRole ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeRole.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400">{activeRole.description || 'No description provided.'}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="danger" onClick={handleDeleteRole}>Delete Role</Button>
                                <Button onClick={handleSavePermissions} isLoading={saving}>Save Permissions</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {MODULES.map(module => (
                                <div key={module.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center font-medium text-gray-900 dark:text-white">
                                            <span className="material-icons-outlined mr-2 text-gray-400">topic</span>
                                            {module.label}
                                        </div>
                                        <label className="text-xs text-primary cursor-pointer hover:underline">
                                            <input
                                                type="checkbox"
                                                className="mr-1 rounded text-primary focus:ring-primary"
                                                onChange={(e) => handleSelectAll(module.id, e.target.checked)}
                                            />
                                            Select All
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        {ACTIONS.map(action => (
                                            <div key={action} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{action}</span>
                                                <Toggle
                                                    checked={permissions[module.id]?.[action] || false}
                                                    onChange={(checked) => handlePermissionChange(module.id, action, checked)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Select a role to view permissions
                    </div>
                )}
            </div>

            {/* Create Role Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Role"
            >
                <form onSubmit={handleCreateRole} className="space-y-4">
                    <Input
                        label="Role Name"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        required
                    />
                    <Input
                        label="Description"
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Role</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-surface-darker dark:text-gray-300">{children}</span>;
}
