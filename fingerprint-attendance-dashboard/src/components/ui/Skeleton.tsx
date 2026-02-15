import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'table';
    rows?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = "text", rows = 5 }) => {
    if (variant === 'table') {
        return (
            <div className={cn("w-full animate-pulse", className)}>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4"></div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "animate-pulse bg-gray-200 dark:bg-gray-700",
                {
                    "rounded-md": variant === 'text',
                    "rounded-full": variant === 'circular',
                    "rounded-lg": variant === 'rectangular',
                    "h-4 w-full": variant === 'text',
                },
                className
            )}
        />
    );
};
