import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    type?: 'success' | 'info' | 'error' | 'neutral';
}

interface TimelineProps {
    items: TimelineItem[];
    title?: string;
    viewAllLink?: string;
    className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
    items,
    title = "Recent Activity",
    viewAllLink,
    className
}) => {
    const typeStyles = {
        success: "bg-green-500",
        info: "bg-blue-500",
        error: "bg-red-500",
        neutral: "bg-gray-400",
    };

    return (
        <div className={cn("bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                {viewAllLink && (
                    <Link href={viewAllLink} className="text-sm text-primary hover:text-primary/80 font-medium">
                        View All
                    </Link>
                )}
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 h-full">
                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-1.5 space-y-6">
                    {items.length === 0 ? (
                        <p className="text-gray-500 text-sm italic pl-4">No recent activity.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="relative pl-6">
                                <span className={cn(
                                    "absolute top-1 left-[-4px] w-2 h-2 rounded-full ring-4 ring-white dark:ring-surface-dark",
                                    typeStyles[item.type || 'neutral']
                                )}></span>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                    <time className="text-xs text-gray-400 dark:text-gray-500">{item.timestamp}</time>
                                </div>
                                {item.description && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
