import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
    header: React.ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        totalItems?: number;
    };
    onRowClick?: (row: T) => void;
    className?: string;
    emptyMessage?: string;
}

// Use a generic function component
export function DataTable<T extends { id?: string | number }>({
    columns,
    data,
    isLoading = false,
    pagination,
    onRowClick,
    className,
    emptyMessage = "No data available",
}: DataTableProps<T>) {

    return (
        <div className={cn("bg-white dark:bg-industrial-surface rounded-xl shadow-sm border border-slate-200 dark:border-industrial-border overflow-hidden flex flex-col", className)}>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-industrial-black/40 border-b border-slate-200 dark:border-industrial-border">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={cn("px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-wider", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-industrial-border/30">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <LoadingSpinner size="md" className="text-primary" />
                                        <span className="text-xs font-semibold text-slate-400 dark:text-industrial-muted uppercase tracking-widest">Hydrating Data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                        <span className="material-icons-outlined text-4xl text-slate-400">inventory_2</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={cn(
                                        "transition-all duration-200 group/row",
                                        onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/5" : "hover:bg-slate-50/50 dark:hover:bg-industrial-surface-hover/20"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-industrial-text">
                                            {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-industrial-border bg-slate-50 dark:bg-industrial-black/40 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-wider">
                        Showing <span className="text-slate-900 dark:text-white">{(pagination.currentPage - 1) * 10 + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(pagination.currentPage * 10, pagination.totalItems || 0)}</span> of <span className="text-slate-900 dark:text-white">{pagination.totalItems || '0'}</span> entries
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-industrial-border bg-white dark:bg-industrial-black text-[10px] font-extrabold text-slate-600 dark:text-industrial-muted uppercase tracking-wider disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-industrial-surface hover:text-primary transition-all flex items-center shadow-sm"
                        >
                            <span className="material-icons-outlined text-sm mr-1">chevron_left</span>
                            Previous
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-industrial-border bg-white dark:bg-industrial-black text-[10px] font-extrabold text-slate-600 dark:text-industrial-muted uppercase tracking-wider disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-industrial-surface hover:text-primary transition-all flex items-center shadow-sm"
                        >
                            Next
                            <span className="material-icons-outlined text-sm ml-1">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
