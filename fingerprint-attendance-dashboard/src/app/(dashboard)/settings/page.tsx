'use client';

import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Toggle } from '@/components/ui/Toggle';
import { showToast } from '@/components/ui/Toast';
import { settingsService } from '@/services/settings.service';
import { SystemSettings, BackupHistory } from '@/types/settings.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: <span className="material-icons-outlined">settings</span> },
    { id: 'sync', label: 'Sync Configuration', icon: <span className="material-icons-outlined">sync</span> },
    { id: 'backup', label: 'Backup & Restore', icon: <span className="material-icons-outlined">backup</span> },
    { id: 'security', label: 'Security & Notifications', icon: <span className="material-icons-outlined">security</span> },
];

export default function SettingsPage() {
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Configure system parameters, backups, and security.</p>
            </div>

            <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Name</label>
                            <input
                                type="text"
                                value={settings.app_name}
                                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave({ app_name: settings.app_name })}
                                disabled={saving}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SYNC TAB */}
                {activeTab === 'sync' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sync Interval (Minutes)</label>
                            <select
                                value={settings.sync_interval}
                                onChange={(e) => setSettings({ ...settings, sync_interval: Number(e.target.value) })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm"
                            >
                                <option value={5}>5 Minutes</option>
                                <option value={15}>15 Minutes</option>
                                <option value={30}>30 Minutes</option>
                                <option value={60}>60 Minutes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conflict Resolution</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={settings.conflict_resolution_mode === 'server'}
                                        onChange={() => setSettings({ ...settings, conflict_resolution_mode: 'server' })}
                                        className="form-radio text-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Server Override</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={settings.conflict_resolution_mode === 'device'}
                                        onChange={() => setSettings({ ...settings, conflict_resolution_mode: 'device' })}
                                        className="form-radio text-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Device Override</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retry Attempts</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={settings.max_retry_attempts}
                                onChange={(e) => setSettings({ ...settings, max_retry_attempts: Number(e.target.value) })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            />
                            <p className="mt-1 text-xs text-gray-500">Number of times to retry failed sync operations (0-10)</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave({
                                    sync_interval: settings.sync_interval,
                                    conflict_resolution_mode: settings.conflict_resolution_mode,
                                    max_retry_attempts: settings.max_retry_attempts
                                })}
                                disabled={saving}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                )}

                {/* BACKUP TAB */}
                {activeTab === 'backup' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Settings */}
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Settings</h3>
                            <Toggle
                                label="Maintenance Mode"
                                description="Prevent user access during maintenance"
                                checked={settings.maintenance_mode}
                                onChange={(checked) => {
                                    setSettings({ ...settings, maintenance_mode: checked });
                                    handleSave({ maintenance_mode: checked });
                                }}
                            />
                            <Toggle
                                label="Auto Daily Backup"
                                description="Backup database according to schedule"
                                checked={settings.auto_backup_enabled}
                                onChange={(checked) => {
                                    setSettings({ ...settings, auto_backup_enabled: checked });
                                    handleSave({ auto_backup_enabled: checked });
                                }}
                            />
                            {settings.auto_backup_enabled && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Schedule (Cron)</label>
                                    <input
                                        type="text"
                                        value={settings.backup_schedule}
                                        onChange={(e) => setSettings({ ...settings, backup_schedule: e.target.value })}
                                        onBlur={() => handleSave({ backup_schedule: settings.backup_schedule })}
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                        placeholder="0 0 * * *"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Cron expression (e.g., '0 0 * * *' for daily at midnight)</p>
                                </div>
                            )}
                            <button
                                onClick={handleCreateBackup}
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center"
                            >
                                <span className="material-icons-outlined mr-2">save</span>
                                Manual Backup Now
                            </button>
                        </div>

                        {/* Column 2 & 3: History */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Backup History</h3>
                            {loadingBackups ? (
                                <LoadingSpinner />
                            ) : backups.length === 0 ? (
                                <div className="text-gray-500 text-sm">No backups found.</div>
                            ) : (
                                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                            {backups.map((backup) => (
                                                <tr key={backup.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                                                        {new Date(backup.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${backup.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {backup.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                                        {(backup.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm space-x-2">
                                                        <button onClick={() => handleDownloadBackup(backup.id, backup.filename)} className="text-gray-400 hover:text-primary" title="Download">
                                                            <span className="material-icons-outlined text-lg">download</span>
                                                        </button>
                                                        <button onClick={() => handleRestoreBackup(backup.id)} className="text-gray-400 hover:text-amber-500" title="Restore">
                                                            <span className="material-icons-outlined text-lg">restore</span>
                                                        </button>
                                                        <button onClick={() => handleDeleteBackup(backup.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                                                            <span className="material-icons-outlined text-lg">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="space-y-6 max-w-2xl">
                        <Toggle
                            label="Email Notifications"
                            description="Receive system alerts via email"
                            checked={settings.email_notifications_enabled}
                            onChange={(checked) => {
                                setSettings({ ...settings, email_notifications_enabled: checked });
                                handleSave({ email_notifications_enabled: checked });
                            }}
                        />
                        <Toggle
                            label="SMS Notifications"
                            description="Receive critical alerts via SMS"
                            checked={settings.sms_notifications_enabled}
                            onChange={(checked) => {
                                setSettings({ ...settings, sms_notifications_enabled: checked });
                                handleSave({ sms_notifications_enabled: checked });
                            }}
                        />
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Email Address (Primary)</label>
                            <input
                                type="email"
                                value={settings.notification_email || ''}
                                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Recipients</label>
                            <textarea
                                value={settings.notification_recipients?.join('\n') || ''}
                                onChange={(e) => setSettings({ ...settings, notification_recipients: e.target.value.split('\n') })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-darker px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                placeholder="one@example.com&#10;two@example.com"
                                rows={3}
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter email addresses separated by new lines</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave({
                                    notification_email: settings.notification_email,
                                    notification_recipients: settings.notification_recipients
                                })}
                                disabled={saving}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
