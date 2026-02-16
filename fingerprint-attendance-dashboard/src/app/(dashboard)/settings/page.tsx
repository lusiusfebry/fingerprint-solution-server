'use client';

import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Toggle } from '@/components/ui/Toggle';
import { showToast } from '@/components/ui/Toast';
import { settingsService } from '@/services/settings.service';
import { SystemSettings, BackupHistory } from '@/types/settings.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: <span className="material-icons-outlined">settings</span> },
    { id: 'sync', label: 'Sync Configuration', icon: <span className="material-icons-outlined">sync</span> },
    { id: 'backup', label: 'Backup & Restore', icon: <span className="material-icons-outlined">backup</span> },
    { id: 'security', label: 'Security & Notifications', icon: <span className="material-icons-outlined">security</span> },
];

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Backup State
    const [backups, setBackups] = useState<BackupHistory[]>([]);
    const [loadingBackups, setLoadingBackups] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'backup') {
            fetchBackups();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (_error) {
            console.error(_error);
            showToast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchBackups = async () => {
        setLoadingBackups(true);
        try {
            const result = await settingsService.getBackupHistory();
            setBackups(result.data);
        } catch {
            showToast.error('Failed to load backups');
        } finally {
            setLoadingBackups(false);
        }
    };

    const handleSave = async (data: Partial<SystemSettings>) => {
        setSaving(true);
        try {
            const updated = await settingsService.updateSettings(data);
            setSettings(updated);
            showToast.success('Settings updated successfully');
        } catch (_error) {
            console.error(_error);
            showToast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            showToast.info('Backup started...');
            await settingsService.createBackup('manual');
            showToast.success('Backup created successfully');
            fetchBackups();
        } catch {
            showToast.error('Backup failed');
        }
    };

    const handleRestoreBackup = async (id: string) => {
        if (!confirm('WARNING: This will overwrite the current database. Are you sure?')) return;
        try {
            await settingsService.restoreBackup(id);
            showToast.success('Database restored successfully');
        } catch {
            showToast.error('Restore failed');
        }
    };

    const handleDeleteBackup = async (id: string) => {
        if (!confirm('Are you sure you want to delete this backup?')) return;
        try {
            await settingsService.deleteBackup(id);
            showToast.success('Backup deleted');
            fetchBackups();
        } catch {
            showToast.error('Failed to delete backup');
        }
    };

    const handleDownloadBackup = async (id: string, filename: string) => {
        try {
            const blob = await settingsService.downloadBackup(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            showToast.error('Download failed');
        }
    };

    if (loading || !settings) return <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="w-fit -ml-2 text-slate-500 hover:text-primary"
                        leftIcon={<span className="material-icons-outlined text-sm">arrow_back</span>}
                    >
                        Kembali ke Dashboard
                    </Button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Configuration</h1>
                        <p className="text-sm text-slate-500 dark:text-industrial-muted">Manage global parameters, security protocols, and data recovery.</p>
                    </div>
                </div>

                <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="bg-white dark:bg-industrial-surface rounded-2xl shadow-sm border border-slate-100 dark:border-industrial-border overflow-hidden">
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="p-8 space-y-8 max-w-3xl">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Global Instance Name</label>
                                    <input
                                        type="text"
                                        value={settings.app_name}
                                        onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="e.g. BioSync Enterprise"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-industrial-border">
                                <Button
                                    onClick={() => handleSave({ app_name: settings.app_name })}
                                    isLoading={saving}
                                    className="bg-primary hover:bg-blue-600 text-white min-w-[140px]"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* SYNC TAB */}
                    {activeTab === 'sync' && (
                        <div className="p-8 space-y-8 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Sync Frequency</label>
                                    <select
                                        value={settings.sync_interval}
                                        onChange={(e) => setSettings({ ...settings, sync_interval: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value={5}>Every 5 Minutes</option>
                                        <option value={15}>Every 15 Minutes</option>
                                        <option value={30}>Every 30 Minutes</option>
                                        <option value={60}>Every 1 Hour</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Retry Policy</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={settings.max_retry_attempts}
                                        onChange={(e) => setSettings({ ...settings, max_retry_attempts: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400 italic">Attempts before marking a sync as permanently failed.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Hardware Conflict Resolution</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSettings({ ...settings, conflict_resolution_mode: 'server' })}
                                        className={`flex-1 p-4 rounded-xl border transition-all text-left ${settings.conflict_resolution_mode === 'server' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black'}`}
                                    >
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">Server Authority</div>
                                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Database values take precedence over hardware storage.</div>
                                    </button>
                                    <button
                                        onClick={() => setSettings({ ...settings, conflict_resolution_mode: 'device' })}
                                        className={`flex-1 p-4 rounded-xl border transition-all text-left ${settings.conflict_resolution_mode === 'device' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black'}`}
                                    >
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">Terminal Authority</div>
                                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Hardware records overwrite server database entries.</div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-industrial-border">
                                <Button
                                    onClick={() => handleSave({
                                        sync_interval: settings.sync_interval,
                                        conflict_resolution_mode: settings.conflict_resolution_mode,
                                        max_retry_attempts: settings.max_retry_attempts
                                    })}
                                    isLoading={saving}
                                    className="bg-primary hover:bg-blue-600 text-white min-w-[160px]"
                                >
                                    Deploy Configuration
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* BACKUP TAB */}
                    {activeTab === 'backup' && (
                        <div className="p-8 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Column 1: Settings */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-industrial-border pb-3">
                                        <span className="material-icons-outlined text-primary text-xl">shield</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Recovery Protocols</h3>
                                    </div>

                                    <Toggle
                                        label="Maintenance Status"
                                        description="Restrict access for system-wide updates."
                                        checked={settings.maintenance_mode}
                                        onChange={(checked) => {
                                            setSettings({ ...settings, maintenance_mode: checked });
                                            handleSave({ maintenance_mode: checked });
                                        }}
                                    />
                                    <Toggle
                                        label="Automated Backups"
                                        description="Schedule periodic snapshots of the core database."
                                        checked={settings.auto_backup_enabled}
                                        onChange={(checked) => {
                                            setSettings({ ...settings, auto_backup_enabled: checked });
                                            handleSave({ auto_backup_enabled: checked });
                                        }}
                                    />
                                    {settings.auto_backup_enabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted uppercase">Backup Schedule (Cron)</label>
                                            <input
                                                type="text"
                                                value={settings.backup_schedule}
                                                onChange={(e) => setSettings({ ...settings, backup_schedule: e.target.value })}
                                                onBlur={() => handleSave({ backup_schedule: settings.backup_schedule })}
                                                className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-2 text-xs font-mono"
                                                placeholder="0 0 * * *"
                                            />
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleCreateBackup}
                                        variant="outline"
                                        className="w-full border-slate-200 dark:border-industrial-border text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-industrial-black"
                                        leftIcon={<span className="material-icons-outlined text-lg">cloud_upload</span>}
                                    >
                                        Initiate Manual Backup
                                    </Button>
                                </div>

                                {/* History */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-industrial-border pb-3">
                                        <span className="material-icons-outlined text-primary text-xl">history</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Redundancy History</h3>
                                    </div>

                                    {loadingBackups ? (
                                        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                                    ) : backups.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400 italic text-sm">No archive records found.</div>
                                    ) : (
                                        <div className="rounded-xl border border-slate-100 dark:border-industrial-border overflow-hidden">
                                            <table className="min-w-full divide-y divide-slate-100 dark:divide-industrial-border/30">
                                                <thead className="bg-slate-50 dark:bg-industrial-black/50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Timestamp</th>
                                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Origin</th>
                                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Payload Size</th>
                                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-widest">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-industrial-border/20">
                                                    {backups.map((backup) => (
                                                        <tr key={backup.id} className="hover:bg-slate-50/50 dark:hover:bg-industrial-black/10 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                                                {new Date(backup.created_at).toLocaleDateString()}
                                                                <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{new Date(backup.created_at).toLocaleTimeString()}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${backup.type === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                                    {backup.type === 'auto' ? 'Automated' : 'Manual'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-industrial-muted">
                                                                {(backup.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <button onClick={() => handleDownloadBackup(backup.id, backup.filename)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Download Archive">
                                                                        <span className="material-icons-outlined text-lg">download</span>
                                                                    </button>
                                                                    <button onClick={() => handleRestoreBackup(backup.id)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Deploy Archive">
                                                                        <span className="material-icons-outlined text-lg">restart_alt</span>
                                                                    </button>
                                                                    <button onClick={() => handleDeleteBackup(backup.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Purge Archive">
                                                                        <span className="material-icons-outlined text-lg">delete_outline</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="p-8 space-y-10 max-w-3xl">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-industrial-border pb-3">
                                    <span className="material-icons-outlined text-primary text-xl">notifications_active</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Alert Dispatcher</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Toggle
                                        label="Email Dispatch"
                                        description="Broadcast alerts via SMTP protocols."
                                        checked={settings.email_notifications_enabled}
                                        onChange={(checked) => {
                                            setSettings({ ...settings, email_notifications_enabled: checked });
                                            handleSave({ email_notifications_enabled: checked });
                                        }}
                                    />
                                    <Toggle
                                        label="SMS Dispatch"
                                        description="Broadcast critical failure alerts via SMS/GSM."
                                        checked={settings.sms_notifications_enabled}
                                        onChange={(checked) => {
                                            setSettings({ ...settings, sms_notifications_enabled: checked });
                                            handleSave({ sms_notifications_enabled: checked });
                                        }}
                                    />
                                </div>

                                <div className="pt-6 grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Primary Administrator Email</label>
                                        <input
                                            type="email"
                                            value={settings.notification_email || ''}
                                            onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
                                            placeholder="admin@biosync.io"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Broadcast Recipient List</label>
                                        <textarea
                                            value={settings.notification_recipients?.join('\n') || ''}
                                            onChange={(e) => setSettings({ ...settings, notification_recipients: e.target.value.split('\n') })}
                                            className="w-full rounded-xl border border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
                                            placeholder="one@biosync.io&#10;two@biosync.io"
                                            rows={4}
                                        />
                                        <p className="text-[10px] text-slate-400 italic">Separate multiple addresses with a new line.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-industrial-border">
                                <Button
                                    onClick={() => handleSave({
                                        notification_email: settings.notification_email,
                                        notification_recipients: settings.notification_recipients
                                    })}
                                    isLoading={saving}
                                    className="bg-primary hover:bg-blue-600 text-white min-w-[160px]"
                                >
                                    Update Security Config
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
