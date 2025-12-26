'use client';

import { memo } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationState } from '@/types/validation';

interface ValidationIconProps {
    state: ValidationState;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

export const ValidationIcon = memo(function ValidationIcon({
    state,
    className,
    size = 'md',
}: ValidationIconProps) {
    const iconSize = sizeClasses[size];

    switch (state) {
        case 'valid':
            return (
                <CheckCircle2
                    className={cn(iconSize, 'text-green-600 dark:text-green-500', className)}
                    aria-hidden="true"
                />
            );
        case 'invalid':
            return (
                <XCircle
                    className={cn(iconSize, 'text-destructive', className)}
                    aria-hidden="true"
                />
            );
        case 'empty':
            return (
                <AlertCircle
                    className={cn(iconSize, 'text-destructive', className)}
                    aria-hidden="true"
                />
            );
        case 'loading':
            return (
                <Loader2
                    className={cn(iconSize, 'text-primary animate-spin', className)}
                    aria-hidden="true"
                />
            );
        case 'focused':
        case 'disabled':
        case 'idle':
        default:
            return null;
    }
});
