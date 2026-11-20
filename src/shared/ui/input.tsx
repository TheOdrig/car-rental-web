'use client';

import * as React from "react"
import { cn } from "@/shared/lib"
import type { ValidationState } from "@/shared/types"
import {
    getValidationBorderClasses,
    determineValidationState
} from "@/shared/lib"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    validationState?: ValidationState;
    error?: string;
    success?: string;
    isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, validationState, error, success, isLoading, disabled, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [isTouched, setIsTouched] = React.useState(false);

        const internalState = determineValidationState({
            value: String(value || ""),
            error,
            isLoading,
            isDisabled: disabled,
            isFocused,
            isTouched,
            isValid: !!success && !error
        });

        const effectiveState = validationState || internalState;

        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    getValidationBorderClasses(effectiveState),
                    effectiveState === 'disabled' && "bg-muted",
                    className
                )}
                ref={ref}
                disabled={disabled}
                value={value}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    setIsTouched(true);
                    props.onBlur?.(e);
                }}
                data-validation-state={effectiveState}
                data-slot="input"
                aria-invalid={effectiveState === 'invalid' || effectiveState === 'empty' ? true : undefined}
                aria-busy={isLoading}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }