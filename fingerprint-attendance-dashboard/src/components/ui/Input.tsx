import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, leftIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        className={cn(
                            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-dark dark:border-gray-700 dark:text-gray-100",
                            leftIcon ? "pl-10" : "",
                            error ? "border-red-500 focus:ring-red-500" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {helperText && !error && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
