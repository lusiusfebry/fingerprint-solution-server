import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Device } from '@/types/device.types';

interface DeviceActionMenuProps {
    device: Device;
    onTestConnection: (device: Device) => void;
    onRestart: (device: Device) => void;
    onSync: (device: Device) => void;
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
    loading?: boolean;
}

export const DeviceActionMenu: React.FC<DeviceActionMenuProps> = ({
    device,
    onTestConnection,
    onRestart,
    onSync,
    onEdit,
    onDelete,
    loading
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action: (d: Device) => void) => {
        action(device);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                disabled={loading}
                className="h-8 w-8 p-0"
            >
                <span className="material-icons-outlined">more_vert</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-surface-dark ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onTestConnection); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            role="menuitem"
                        >
                            <span className="material-icons-outlined text-sm mr-2">network_check</span>
                            Test Connection
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onSync); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            role="menuitem"
                        >
                            <span className="material-icons-outlined text-sm mr-2">sync</span>
                            Sync Data
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onRestart); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            role="menuitem"
                        >
                            <span className="material-icons-outlined text-sm mr-2">restart_alt</span>
                            Restart Device
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onEdit); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            role="menuitem"
                        >
                            <span className="material-icons-outlined text-sm mr-2">edit</span>
                            Edit Configuration
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onDelete); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            role="menuitem"
                        >
                            <span className="material-icons-outlined text-sm mr-2">delete</span>
                            Delete Device
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
