'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import { User, Role } from '@/types/admin.types';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';

export default function UserManagementPage() {
    // ... (rest of states remain the same)
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    // Extended type for form handling
    interface UserForm extends Partial<User> {
        password?: string;
    }
    const [selectedUser, setSelectedUser] = useState<UserForm>({});
    const [saving, setSaving] = useState(false);

    // Delete State
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchRoles = React.useCallback(async () => {
        try {
            const data = await adminService.getRoles();
            setRoles(data);
        } catch {
            console.error('Failed to load roles');
        }
    }, []);

    const fetchUsers = React.useCallback(async (page = 1, searchQuery = search) => {
        setLoading(true);
        try {
            const allUsers = await adminService.getUsers(page, 10, searchQuery);
            let filtered = allUsers;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = allUsers.filter(u =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
                );
            }
            const itemsPerPage = 10;
            const totalItems = filtered.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedUsers = filtered.slice(startIndex, startIndex + itemsPerPage);

            setUsers(paginatedUsers);
            setPagination({
                currentPage: page,
                totalPages: totalPages || 1,
                totalItems: totalItems
            });
        } catch {
            showToast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, [fetchRoles, fetchUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchUsers]);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedUser({ status: 'active' });
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setModalMode('edit');
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await adminService.deleteUser(userToDelete.id);
            showToast.success('User deleted successfully');
            fetchUsers(pagination.currentPage);
            setUserToDelete(null);
        } catch {
            showToast.error('Failed to delete user');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: Record<string, unknown> = { ...selectedUser };
            if (selectedUser.role) {
                payload.role_id = (selectedUser.role as Role).id;
                delete payload.role;
            }

            if (modalMode === 'create') {
                await adminService.createUser(payload as Record<string, unknown>);
                showToast.success('User created successfully');
            } else {
                if (selectedUser.id) {
                    await adminService.updateUser(selectedUser.id, payload as Record<string, unknown>);
                    showToast.success('User updated successfully');
                }
            }
            setIsModalOpen(false);
            fetchUsers(pagination.currentPage);
        } catch {
            showToast.error('Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const columns: Column<User>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: (user) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessorKey: 'role',
            cell: (user) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {user.role?.name || 'No Role'}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (user) => (
                <Badge
                    label={(user.status || 'unknown').toUpperCase()}
                    variant={user.status === 'active' ? 'success' : 'neutral'}
                />
            )
        },
        {
            header: 'Last Login',
            accessorKey: 'last_login',
            cell: (user) => user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
        },
        {
            header: 'Actions',
            cell: (user) => (
                <div className="flex space-x-2 justify-end">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(user); }} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-icons-outlined">edit</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(user); }} className="text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-icons-outlined">delete</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted">Manage system users and access controls.</p>
                    </div>
                    <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
                        <span className="material-icons-outlined mr-2">person_add</span>
                        Add User
                    </Button>
                </div>

                <div className="bg-white dark:bg-industrial-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-industrial-border flex gap-4">
                    <div className="flex-1 max-w-sm">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<span className="material-icons-outlined">search</span>}
                            className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                    pagination={{
                        ...pagination,
                        onPageChange: (page) => fetchUsers(page)
                    }}
                />

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'create' ? 'Add New User' : 'Edit User'}
                >
                    <form onSubmit={handleSave} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={selectedUser.name || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={selectedUser.email || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            required
                        />
                        {modalMode === 'create' && (
                            <Input
                                label="Password"
                                type="password"
                                value={selectedUser.password || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                required={modalMode === 'create'}
                            />
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest ml-1">Role</label>
                            <Select
                                options={roles.map(r => ({ value: r.id, label: r.name }))}
                                value={selectedUser.role?.id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedUser({ ...selectedUser, role: roles.find(r => r.id === val) })
                                }}
                                className="bg-slate-50 dark:bg-industrial-black border-slate-200 dark:border-industrial-border"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedUser.status === 'active'}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.checked ? 'active' : 'inactive' })}
                                        className="h-5 w-5 rounded border-slate-300 dark:border-industrial-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-industrial-text group-hover:text-primary transition-colors">Active Account</span>
                            </label>
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-50 dark:border-industrial-border mt-4">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={saving}>Save User</Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    title="Confirm Deletion"
                >
                    <div className="space-y-6">
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-red-800 dark:text-red-200 text-sm">
                            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? This action will restrict their access to the system immediately.
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} className="shadow-lg shadow-red-500/20">Delete User</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
