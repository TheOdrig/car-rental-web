'use client';

import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormSuccessProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export function FormSuccess({ message, onDismiss, className }: FormSuccessProps) {
    if (!message) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700',
                'dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400',
                className
            )}
        >
            <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-md p-1 hover:bg-green-100 dark:hover:bg-green-900/50"
                    aria-label="Dismiss message"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
