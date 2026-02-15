import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';
    showDot?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'default',
    showDot = false,
    className
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };

    const dotColors = {
        default: 'bg-gray-400',
        neutral: 'bg-gray-400',
        primary: 'bg-blue-400',
        success: 'bg-green-400',
        warning: 'bg-yellow-400',
        error: 'bg-red-400',
        info: 'bg-indigo-400',
    };

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            variants[variant],
            className
        )}>
            {showDot && (
                <span className={cn("w-1.5 h-1.5 mr-1.5 rounded-full", dotColors[variant])} />
            )}
            {label}
        </span>
    );
};
