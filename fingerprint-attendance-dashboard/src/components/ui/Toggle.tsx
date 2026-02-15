import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description, disabled, className }) => {
    return (
        <div className={cn("flex items-start justify-between", className)}>
            {(label || description) && (
                <div className="mr-3">
                    {label && <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{label}</div>}
                    {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
};
