'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Role } from '@/types/admin.types';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { clsx } from 'clsx';

const MODULES = ['devices', 'employees', 'attendance', 'users', 'roles', 'settings', 'audit'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'sync', 'import', 'export'];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState<Record<string, string[]>>({}); // module -> actions[]
    const [saving, setSaving] = useState(false);

    // Create/Edit Role Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });

    const fetchRoles = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getRoles();
            setRoles(data);
            if (data.length > 0 && !selectedRole) {
                // Select first role by default if none selected
                handleRoleSelect(data[0]);
            } else if (selectedRole) {
                // Refresh selected role
                const updated = data.find(r => r.id === selectedRole.id);
                if (updated) handleRoleSelect(updated);
            }
        } catch {
            showToast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, [selectedRole]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        // Transform permissions array to map
        const permMap: Record<string, string[]> = {};
        role.permissions.forEach(p => {
            if (!permMap[p.module]) permMap[p.module] = [];
            permMap[p.module].push(p.action);
        });
        setPermissions(permMap);
    };

    const togglePermission = (module: string, action: string) => {
        const currentActions = permissions[module] || [];
        const newActions = currentActions.includes(action)
            ? currentActions.filter(a => a !== action)
            : [...currentActions, action];

        setPermissions({
            ...permissions,
            [module]: newActions
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            // Transform map back to array of objects
            const payload = Object.entries(permissions).map(([module, actions]) => ({
                module,
                actions
            }));

            await adminService.updatePermissions(selectedRole.id, payload);
            showToast.success('Permissions updated successfully');
            fetchRoles();
        } catch {
            showToast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await adminService.createRole(roleForm.name, roleForm.description);
                showToast.success('Role created');
            } else if (selectedRole) {
                await adminService.updateRole(selectedRole.id, roleForm.name, roleForm.description);
                showToast.success('Role updated');
            }
            setIsModalOpen(false);
            setRoleForm({ name: '', description: '' });
            fetchRoles();
        } catch {
            showToast.error('Failed to save role');
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure? This will remove access for users with this role.')) return;
        try {
            await adminService.deleteRole(id);
            showToast.success('Role deleted');
            setSelectedRole(null);
            fetchRoles();
        } catch {
            showToast.error('Failed to delete role');
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage user roles and access levels.</p>
                </div>
                <Button onClick={() => { setModalMode('create'); setRoleForm({ name: '', description: '' }); setIsModalOpen(true); }}>
                    <span className="material-icons-outlined mr-2">add</span>
                    New Role
                </Button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Roles List */}
                <div className="w-1/3 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-darker rounded-t-xl">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Roles</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
                        {roles.map(role => (
                            <div
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                className={clsx(
                                    "p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center group",
                                    selectedRole?.id === role.id
                                        ? "bg-primary/10 border-primary/20 border"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                                )}
                            >
                                <div>
                                    <h3 className={clsx("font-medium", selectedRole?.id === role.id ? "text-primary" : "text-gray-900 dark:text-white")}>
                                        {role.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{role.description}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setModalMode('edit'); setRoleForm({ name: role.name, description: role.description }); setSelectedRole(role); setIsModalOpen(true); }}
                                        className="p-1 text-gray-400 hover:text-primary"
                                    >
                                        <span className="material-icons-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-darker rounded-t-xl flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                                Permissions for <span className="text-primary">{selectedRole?.name || '...'}</span>
                            </h2>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleSavePermissions}
                            isLoading={saving}
                            disabled={!selectedRole || selectedRole.name === 'Super Admin'} // Super Admin usually has all
                        >
                            Save Changes
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        {!selectedRole ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Select a role to view permissions</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Module</th>
                                        {ACTIONS.map(action => (
                                            <th key={action} className="px-4 py-3 text-center">{action}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map((module) => (
                                        <tr key={module} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white capitalize">
                                                {module}
                                            </td>
                                            {ACTIONS.map(action => {
                                                const isChecked = permissions[module]?.includes(action);
                                                const isSuperAdmin = selectedRole.name === 'Super Admin';

                                                return (
                                                    <td key={action} className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSuperAdmin || isChecked}
                                                            onChange={() => togglePermission(module, action)}
                                                            disabled={isSuperAdmin}
                                                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {selectedRole?.name === 'Super Admin' && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-sm border-t border-yellow-100 dark:border-yellow-900/20">
                            <strong>Note:</strong> Super Admin role has full access by default and cannot be modified.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Create Role' : 'Edit Role'}
            >
                <form onSubmit={handleCreateRole} className="space-y-4">
                    <Input
                        label="Role Name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={3}
                            value={roleForm.description}
                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
