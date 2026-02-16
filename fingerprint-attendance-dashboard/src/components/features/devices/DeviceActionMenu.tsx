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
                className="h-9 w-9 p-0 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-industrial-surface rounded-full transition-all"
            >
                <span className="material-icons-outlined text-xl">more_vert</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-industrial-surface border border-slate-200 dark:border-industrial-border shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1" role="menu">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onTestConnection); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-industrial-black flex items-center transition-colors"
                        >
                            <span className="material-icons-outlined text-sm mr-3 text-slate-400">network_check</span>
                            Test Connection
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onSync); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-industrial-black flex items-center transition-colors"
                        >
                            <span className="material-icons-outlined text-sm mr-3 text-slate-400">sync</span>
                            Synchronize
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onRestart); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-industrial-black flex items-center transition-colors"
                        >
                            <span className="material-icons-outlined text-sm mr-3 text-slate-400">restart_alt</span>
                            Restart Device
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-industrial-border/30 my-1" />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onEdit); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-industrial-black flex items-center transition-colors"
                        >
                            <span className="material-icons-outlined text-sm mr-3 text-slate-400">edit</span>
                            Edit Config
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction(onDelete); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center transition-colors"
                        >
                            <span className="material-icons-outlined text-sm mr-3">delete_outline</span>
                            Delete Device
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
