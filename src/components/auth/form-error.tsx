'use client';

import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export function FormError({ message, onDismiss, className }: FormErrorProps) {
    if (!message) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                'flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700',
                'dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400',
                className
            )}
        >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/50"
                    aria-label="Dismiss error"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
