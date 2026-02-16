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
        default: 'bg-industrial-black border border-industrial-border text-industrial-muted uppercase tracking-[0.15em] font-mono shadow-sm',
        neutral: 'bg-industrial-black border border-industrial-border text-industrial-muted uppercase tracking-[0.15em] font-mono shadow-sm',
        primary: 'bg-primary/10 border border-primary/30 text-primary uppercase tracking-[0.15em] font-mono shadow-glow-sm',
        success: 'bg-primary/10 border border-primary/40 text-primary uppercase tracking-[0.15em] font-mono shadow-glow-sm',
        warning: 'bg-accent-amber/10 border border-accent-amber/30 text-accent-amber uppercase tracking-[0.15em] font-mono shadow-amber-sm',
        error: 'bg-accent-red/10 border border-accent-red/30 text-accent-red uppercase tracking-[0.15em] font-mono shadow-red-sm',
        info: 'bg-primary/5 border border-primary/20 text-primary/80 uppercase tracking-[0.15em] font-mono shadow-sm',
    };

    const dotColors = {
        default: 'bg-industrial-muted',
        neutral: 'bg-industrial-muted',
        primary: 'bg-primary shadow-glow',
        success: 'bg-primary shadow-glow animate-pulse',
        warning: 'bg-accent-amber shadow-amber animate-pulse',
        error: 'bg-accent-red shadow-red animate-pulse',
        info: 'bg-primary/60',
    };

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold leading-none select-none",
            variants[variant],
            className
        )}>
            {showDot && (
                <span className={cn("w-1.5 h-1.5 mr-2 rounded-full", dotColors[variant])} />
            )}
            {label}
        </span>
    );
};
