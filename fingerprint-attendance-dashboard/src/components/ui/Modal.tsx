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
    // ... useEffect ...

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-full mx-4',
    };

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
                "relative bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full transform transition-all sm:my-8 flex flex-col max-h-[90vh]",
                sizeClasses[size],
                "animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-5 sm:slide-in-from-bottom-0",
                className
            )}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-6">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-surface-darker/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex justify-end space-x-3">
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
