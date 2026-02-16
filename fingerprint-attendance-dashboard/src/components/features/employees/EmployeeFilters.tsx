import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface EmployeeFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    department: string;
    onDepartmentChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    departments: string[];
    onBulkAction: (action: 'push' | 'export') => void;
    hasSelection: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
    search,
    onSearchChange,
    department,
    onDepartmentChange,
    status,
    onStatusChange,
    departments,
    onBulkAction,
    hasSelection
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                        <span className="material-icons-outlined text-industrial-muted text-xl">manage_search</span>
                    </span>
                    <Input
                        placeholder="QUERY PERSONNEL BY NAME OR NIK..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-12 bg-industrial-black/50 border-industrial-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-industrial-text font-mono text-xs uppercase tracking-widest placeholder-industrial-muted/50 h-12"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                    <Select
                        value={department}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        className="bg-industrial-black/50 border-industrial-border text-industrial-text font-mono text-[10px] uppercase tracking-widest h-12"
                        options={[
                            { value: 'all', label: 'DEPT/ALL_SECTORS' },
                            ...departments.map(d => ({ value: d, label: `DEPT/${d.toUpperCase()}` }))
                        ]}
                    />
                </div>
                <div className="lg:col-span-1">
                    <Select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="bg-industrial-black/50 border-industrial-border text-industrial-text font-mono text-[10px] uppercase tracking-widest h-12"
                        options={[
                            { value: 'all', label: 'STS/ALL_PROFILES' },
                            { value: 'aktif', label: 'STS/ACTIVE_NODE' },
                            { value: 'nonaktif', label: 'STS/DEACTIVATED' }
                        ]}
                    />
                </div>
                <div className="lg:col-span-2 flex gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 lg:flex-none bg-industrial-black/40 border border-industrial-border text-industrial-muted hover:text-primary hover:border-primary/40 text-[9px] font-bold uppercase tracking-widest h-12 px-5"
                        leftIcon={<span className="material-icons-outlined text-sm">download</span>}
                        onClick={() => onBulkAction('export')}
                    >
                        Export.DB
                    </Button>
                    {hasSelection && (
                        <Button
                            variant="secondary"
                            className="flex-1 bg-primary shadow-glow text-industrial-black text-[9px] font-bold uppercase tracking-widest h-12 px-6 hover:bg-primary/90 transition-all animate-in zoom-in-95 duration-200"
                            leftIcon={<span className="material-icons-outlined text-sm">sync_alt</span>}
                            onClick={() => onBulkAction('push')}
                        >
                            Sync to Nodes
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
