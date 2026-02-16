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
    const colorVariants = {
        primary: "border-primary text-primary",
        success: "border-accent-green text-accent-green",
        warning: "border-accent-amber text-accent-amber",
        danger: "border-accent-red text-accent-red",
        info: "border-primary text-primary",
    };

    return (
        <div className={cn(
            "relative overflow-hidden bg-white dark:bg-industrial-surface p-6 rounded-xl border-t-4 shadow-sm hover:shadow-md transition-all duration-300 group",
            colorVariants[color],
            className
        )}>
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-industrial-muted uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {value}
                        </h3>
                        {trend && (
                            <div className={cn(
                                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
                                trend.isPositive ? "text-green-600 bg-green-50 dark:bg-green-500/10" : "text-red-600 bg-red-50 dark:bg-red-500/10"
                            )}>
                                <span className="material-icons-outlined text-xs mr-0.5">{trend.isPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                                {trend.value}
                            </div>
                        )}
                    </div>

                    {subtitle && <p className="text-xs text-slate-500 dark:text-industrial-muted font-medium">{subtitle}</p>}

                    {badges && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {badges.map((badge, idx) => (
                                <Badge key={idx} label={badge.label} variant={badge.variant} className="text-[10px] py-0.5" />
                            ))}
                        </div>
                    )}

                    {progress && (
                        <div className="w-full space-y-2 pt-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-industrial-muted">
                                <span>{progress.label || 'Progress'}</span>
                                <span>{Math.round((progress.value / progress.max) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-industrial-black rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000",
                                        color === 'primary' ? 'bg-primary' :
                                            color === 'success' ? 'bg-accent-green' :
                                                color === 'warning' ? 'bg-accent-amber' : 'bg-primary'
                                    )}
                                    style={{ width: `${(progress.value / progress.max) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={cn("p-3 rounded-lg bg-slate-50 dark:bg-industrial-black/40 group-hover:scale-110 transition-transform duration-300", colorVariants[color])}>
                    <span className="material-icons-outlined text-2xl">{icon}</span>
                </div>
            </div>

            {/* Background Narrative Icon Decoration */}
            <span className="material-icons-outlined absolute -right-6 -bottom-6 text-9xl text-slate-200/40 dark:text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                {icon}
            </span>
        </div>
    );
};
