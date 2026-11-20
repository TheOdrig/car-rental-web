'use client';

import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib';

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
                'flex items-center gap-3 rounded-lg border border-success-subtle-foreground/30 bg-success-subtle p-4 text-success-subtle-foreground',
                className
            )}
        >
            <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-md p-1 hover:bg-success-subtle"
                    aria-label="Dismiss message"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}