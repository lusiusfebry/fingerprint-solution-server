"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className,
    size = 'md',
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-full mx-4',
    };

    // Use portal if accessible, otherwise render inline (SSR safe check needed usually, but 'use client' helps)
    // For simplicity using simple render, but ideally use createPortal to document.body
    // Since we are in Next.js app router, createPortal is fine in client component.

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Panel */}
            <div className={cn(
                "relative glass-surface border border-industrial-border/50 shadow-industrial w-full transform transition-all sm:my-8 flex flex-col max-h-[90vh] overflow-hidden rounded-xl",
                sizeClasses[size],
                "animate-in fade-in zoom-in-95 duration-300 slide-in-from-bottom-5 sm:slide-in-from-bottom-0",
                className
            )}>
                {/* Header */}
                <div className="px-8 py-5 border-b border-industrial-border/40 flex items-center justify-between bg-industrial-black/40">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-industrial-text tracking-tight font-display">{title}</h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full shadow-glow" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] font-mono">Process.Overlay // Active</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-50 h-10 w-10 flex items-center justify-center rounded bg-industrial-black/50 border border-industrial-border text-industrial-muted hover:text-accent-red hover:border-accent-red/40 transition-all group pointer-events-auto"
                        title="Close Interface"
                    >
                        <span className="material-icons-outlined group-hover:rotate-90 transition-transform">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6 overflow-y-auto custom-scrollbar bg-industrial-surface/20">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 py-5 bg-industrial-black/40 border-t border-industrial-border/40 flex justify-end items-center space-x-4">
                        {footer}
                    </div>
                )}
            </div>
        </div >
    );

    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null;
};
