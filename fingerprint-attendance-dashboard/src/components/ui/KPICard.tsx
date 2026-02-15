import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
    badges?: { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }[];
    progress?: {
        value: number;
        max: number;
        label?: string;
    };
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'primary',
    className,
    badges,
    progress,
}) => {
    const colorStyles = {
        primary: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        success: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        warning: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        info: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    };

    return (
        <div className={cn("bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-all", className)}>
            <div className="flex justify-between items-start">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                        {trend && (
                            <span className={cn(
                                "ml-2 text-xs font-medium px-2 py-0.5 rounded-full flex items-center",
                                trend.isPositive ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                                <span className="material-icons-outlined text-[10px] mr-0.5">{trend.isPositive ? 'trending_up' : 'trending_down'}</span>
                                {trend.value}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
                    )}

                    {badges && (
                        <div className="mt-3 flex gap-2">
                            {badges.map((badge, idx) => (
                                <Badge key={idx} label={badge.label} variant={badge.variant} showDot />
                            ))}
                        </div>
                    )}

                    {progress && (
                        <div className="mt-3 w-full">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">{progress.label || 'Progress'}</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{Math.round((progress.value / progress.max) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className={cn("h-1.5 rounded-full", colorStyles[color].split(' ')[0].replace('bg-', 'bg-type-'))} // Simple hack, ideally explicit color map for progress
                                    style={{ width: `${(progress.value / progress.max) * 100}%`, backgroundColor: 'currentColor' }}
                                ></div>
                            </div>
                        </div>
                    )}

                </div>
                <div className={cn("p-3 rounded-lg transition-opacity opacity-80 group-hover:opacity-100", colorStyles[color])}>
                    <span className="material-icons-outlined text-2xl">{icon}</span>
                </div>
            </div>

            {/* Background Icon Decoration */}
            <span className="material-icons-outlined absolute -right-6 -bottom-6 text-9xl text-gray-50 dark:text-surface-darker opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500 ease-in-out">
                {icon}
            </span>
        </div>
    );
};
