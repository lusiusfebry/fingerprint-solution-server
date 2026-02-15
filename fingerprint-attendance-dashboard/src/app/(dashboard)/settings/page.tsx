"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400">Configure application preferences</p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>

                    <form className="max-w-md space-y-4">
                        <Input label="Application Name" defaultValue="BioSync Server X105D" />
                        <Input label="Auto-Sync Interval (minutes)" type="number" defaultValue="15" />

                        <div className="pt-4">
                            <Button>Save Changes</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h3>
                    <p className="text-gray-500 text-sm">Irreversible actions</p>

                    <Button variant="danger">Clear All Logs</Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
