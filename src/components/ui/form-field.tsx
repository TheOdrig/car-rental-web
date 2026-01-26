'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ValidationIcon } from '@/components/shared/validation-icon';
import type { ValidationState } from '@/types/validation';
import { getValidationMessageClasses, getValidationAriaLabel } from '@/lib/utils/validation-ui';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    success?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    required?: boolean;
    validationState?: ValidationState;
    showIcon?: boolean;
    description?: ReactNode;
    children: ReactNode;
    className?: string;
}

export const FormField = memo(function FormField({
    label,
    htmlFor,
    error,
    success,
    isLoading = false,
    isDisabled = false,
    required = false,
    validationState = 'idle',
    showIcon = true,
    description,
    children,
    className,
}: FormFieldProps) {
    const effectiveState: ValidationState = isLoading
        ? 'loading'
        : isDisabled
            ? 'disabled'
            : validationState;

    const message = error || success;
    const messageId = message ? `${htmlFor}-message` : undefined;
    const descriptionId = description ? `${htmlFor}-description` : undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <Label
                htmlFor={htmlFor}
                className={cn(
                    isDisabled && 'text-slate-600 dark:text-slate-400 cursor-not-allowed'
                )}
            >
                {label}
                {required && (
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                )}
            </Label>

            {description && (
                <div
                    id={descriptionId}
                    className="text-sm text-slate-600 dark:text-slate-400"
                >
                    {description}
                </div>
            )}

            <div className="relative">
                {children}

                {showIcon && effectiveState !== 'idle' && effectiveState !== 'focused' && effectiveState !== 'disabled' && (
                    <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-label={getValidationAriaLabel(effectiveState, error)}
                    >
                        <ValidationIcon state={effectiveState} size="sm" />
                    </div>
                )}
            </div>

            {message && (
                <p
                    id={messageId}
                    className={cn(
                        'text-sm flex items-center gap-1.5',
                        getValidationMessageClasses(effectiveState)
                    )}
                    role={error ? 'alert' : undefined}
                    aria-live={error ? 'polite' : undefined}
                >
                    {message}
                </p>
            )}
        </div>
    );
});

