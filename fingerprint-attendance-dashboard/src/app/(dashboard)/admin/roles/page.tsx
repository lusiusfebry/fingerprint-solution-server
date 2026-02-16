'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Role } from '@/types/admin.types';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { clsx } from 'clsx';

import DashboardLayout from '@/components/layout/DashboardLayout';

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

            // If we have a selected role, refresh it. If not, select the first one.
            setSelectedRole(prev => {
                if (!data.length) return null;
                if (!prev) return data[0];
                const updated = data.find(r => r.id === prev.id);
                return updated || data[0];
            });
        } catch {
            showToast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedRole) {
            const permMap: Record<string, string[]> = {};
            selectedRole.permissions.forEach(p => {
                if (!permMap[p.module]) permMap[p.module] = [];
                permMap[p.module].push(p.action);
            });
            setPermissions(permMap);
        }
    }, [selectedRole]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
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
        <DashboardLayout>
            <div className="h-[calc(100vh-10rem)] flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Roles & Permissions</h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted mt-1">Manage user roles and granular access levels.</p>
                    </div>
                    <Button onClick={() => { setModalMode('create'); setRoleForm({ name: '', description: '' }); setIsModalOpen(true); }} className="shadow-lg shadow-primary/20">
                        <span className="material-icons-outlined mr-2">add_moderator</span>
                        New Role
                    </Button>
                </div>

                <div className="flex flex-1 gap-8 overflow-hidden">
                    {/* Roles List */}
                    <div className="w-80 bg-white dark:bg-industrial-surface rounded-2xl border border-slate-100 dark:border-industrial-border flex flex-col shadow-sm">
                        <div className="p-4 border-b border-slate-50 dark:border-industrial-border bg-slate-50/50 dark:bg-industrial-black/30 rounded-t-2xl">
                            <h2 className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Available Roles</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading && <div className="p-4 text-center text-slate-400 text-sm">Loading security profiles...</div>}
                            {roles.map(role => (
                                <div
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role)}
                                    className={clsx(
                                        "p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden",
                                        selectedRole?.id === role.id
                                            ? "bg-primary/5 border-primary/20 border ring-1 ring-primary/10"
                                            : "hover:bg-slate-50 dark:hover:bg-industrial-black/40 border border-transparent shadow-none"
                                    )}
                                >
                                    {selectedRole?.id === role.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                    <div className="pl-1">
                                        <h3 className={clsx("text-sm font-bold", selectedRole?.id === role.id ? "text-primary dark:text-primary" : "text-slate-900 dark:text-white")}>
                                            {role.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{role.description}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setModalMode('edit'); setRoleForm({ name: role.name, description: role.description }); setSelectedRole(role); setIsModalOpen(true); }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Matrix */}
                    <div className="flex-1 bg-white dark:bg-industrial-surface rounded-2xl border border-slate-100 dark:border-industrial-border flex flex-col shadow-sm">
                        <div className="p-4 border-b border-slate-50 dark:border-industrial-border bg-slate-50/50 dark:bg-industrial-black/30 rounded-t-2xl flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Access Matrix: <span className="text-primary tracking-tight font-black ml-1 uppercase">{selectedRole?.name || '...'}</span>
                                </h2>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleSavePermissions}
                                isLoading={saving}
                                disabled={!selectedRole || selectedRole.name === 'Super Admin'}
                                className="px-6"
                            >
                                Deploy Permissions
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            {!selectedRole ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                    <span className="material-icons-outlined text-4xl opacity-20">admin_panel_settings</span>
                                    <p className="text-sm italic">Select a role to configure security matrix</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-industrial-black/20">
                                            <th className="px-4 py-3 rounded-tl-xl text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest border-b border-slate-100 dark:border-industrial-border">Module</th>
                                            {ACTIONS.map(action => (
                                                <th key={action} className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest border-b border-slate-100 dark:border-industrial-border">{action}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-industrial-border/20">
                                        {MODULES.map((module) => (
                                            <tr key={module} className="hover:bg-slate-50/30 dark:hover:bg-industrial-black/10 transition-colors">
                                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white capitalize border-r border-slate-50 dark:border-industrial-border/30">
                                                    {module}
                                                </td>
                                                {ACTIONS.map(action => {
                                                    const isChecked = permissions[module]?.includes(action);
                                                    const isSuperAdmin = selectedRole.name === 'Super Admin';

                                                    return (
                                                        <td key={action} className="px-4 py-4 text-center">
                                                            <div className="flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!(isSuperAdmin || isChecked)}
                                                                    onChange={() => togglePermission(module, action)}
                                                                    disabled={isSuperAdmin}
                                                                    className="w-5 h-5 text-primary bg-slate-100 border-slate-300 dark:border-industrial-border rounded focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
                                                                />
                                                            </div>
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
                            <div className="p-4 bg-primary/5 dark:bg-primary/5 text-primary text-[11px] font-bold border-t border-primary/10 flex items-center gap-2">
                                <span className="material-icons-outlined text-sm">security_update_good</span>
                                Super Admin accounts maintain peak authority and bypass individual matrix checks.
                            </div>
                        )}
                    </div>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'create' ? 'Define New Security Profile' : 'Edit Security Profile'}
                >
                    <form onSubmit={handleCreateRole} className="space-y-5">
                        <Input
                            label="Profile Name"
                            value={roleForm.name}
                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                            required
                            placeholder="e.g. Operations Manager"
                        />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest ml-1">Profile Scope & Description</label>
                            <textarea
                                className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                rows={3}
                                value={roleForm.description}
                                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                placeholder="Describe the responsibilities of this role..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-50 dark:border-industrial-border">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="px-8 shadow-lg shadow-primary/20">Save Profile</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
