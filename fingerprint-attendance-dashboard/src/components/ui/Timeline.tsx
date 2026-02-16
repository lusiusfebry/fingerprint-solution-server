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
    viewAllLink
}) => {


    return (
        <div className="bg-white dark:bg-industrial-surface rounded-xl shadow-sm border border-slate-200 dark:border-industrial-border p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{title}</h3>
                {viewAllLink && (
                    <Link href={viewAllLink} className="text-xs text-primary font-bold hover:underline">
                        View History
                    </Link>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="relative border-l border-slate-200 dark:border-industrial-border ml-2 space-y-8 pb-2">
                    {items.length === 0 ? (
                        <p className="text-slate-400 dark:text-industrial-muted text-xs italic pl-6">No recent streams detected.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="relative pl-8">
                                <span className={cn(
                                    "absolute top-1.5 left-[-5px] w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-industrial-surface shadow-sm",
                                    item.type === 'success' ? 'bg-green-500' :
                                        item.type === 'error' ? 'bg-red-500' : 'bg-primary'
                                )}></span>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.title}</h4>
                                        <time className="text-[10px] font-bold text-slate-400 dark:text-industrial-muted whitespace-nowrap ml-4">{item.timestamp}</time>
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-slate-500 dark:text-industrial-muted font-medium leading-relaxed">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
