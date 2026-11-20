'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib';

interface FormErrorProps {
    id?: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
    focusOnShow?: boolean;
}

export function FormError({ id, message, onDismiss, className, focusOnShow = false }: FormErrorProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (message && focusOnShow) {
            ref.current?.focus();
        }
    }, [message, focusOnShow]);

    if (!message) return null;

    return (
        <div
            ref={ref}
            tabIndex={-1}
            id={id}
            role="alert"
            aria-live="assertive"
            className={cn(
                'flex items-center gap-3 rounded-lg border border-danger-subtle-foreground/30 bg-danger-subtle p-4 text-danger-subtle-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
        >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-md p-1 hover:bg-danger-subtle"
                    aria-label="Dismiss error"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}