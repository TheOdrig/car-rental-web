'use client';

import { Children, cloneElement, isValidElement, memo, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Label } from '@/shared/ui/label';
import { ValidationIcon } from '@/shared/ui';
import type { ValidationState } from '@/shared/types';
import { getValidationMessageClasses, getValidationAriaLabel } from '@/shared/lib';

function linkControl(node: ReactNode, controlId: string, describedBy: string | undefined): ReactNode {
    if (!describedBy) {
        return node;
    }

    return Children.map(node, (child) => {
        if (!isValidElement(child)) {
            return child;
        }

        const element = child as ReactElement<{ id?: string; children?: ReactNode; 'aria-describedby'?: string }>;
        if (element.props.id === controlId) {
            const existing = element.props['aria-describedby'];
            return cloneElement(element, { 'aria-describedby': existing ? `${existing} ${describedBy}` : describedBy });
        }

        if (element.props.children === undefined || typeof element.type === 'function') {
            return child;
        }

        return cloneElement(element, undefined, linkControl(element.props.children, controlId, describedBy));
    });
}

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
    const describedBy = [descriptionId, messageId].filter(Boolean).join(' ') || undefined;

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
                {linkControl(children, htmlFor, describedBy)}

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