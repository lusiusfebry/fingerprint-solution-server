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
        <div className={cn("bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col", className)}>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-surface-darker/50 sticky top-0 z-10">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={cn("px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <LoadingSpinner size="lg" className="mb-2" />
                                        <span className="text-sm">Loading data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="material-icons-outlined text-4xl text-gray-300 mb-2">inbox</span>
                                        <span>{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={cn(
                                        "transition-colors",
                                        onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50" : "hover:bg-gray-50/50 dark:hover:bg-slate-800/20"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
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
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-surface-darker/30 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing page <span className="font-medium">{pagination.currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span>
                        {pagination.totalItems && <> (<span className="font-medium">{pagination.totalItems}</span> items)</>}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
