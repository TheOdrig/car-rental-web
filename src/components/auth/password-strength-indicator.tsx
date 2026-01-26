'use client';

import { cn } from '@/lib/utils';
import {
    calculatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthLabel,
    getPasswordStrengthProgress,
    getPasswordStrengthTextColor,
    getPasswordSuggestions,
} from '@/lib/utils/validation';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
    showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
    password,
    className,
    showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
    if (!password) return null;

    const strength = calculatePasswordStrength(password);
    const progress = getPasswordStrengthProgress(strength);
    const label = getPasswordStrengthLabel(strength);
    const bgColor = getPasswordStrengthColor(strength);
    const textColor = getPasswordStrengthTextColor(strength);
    const suggestions = showSuggestions ? getPasswordSuggestions(password) : [];

    return (
        <div className={cn('space-y-2', className)} role="status" aria-live="polite">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={cn('font-medium', textColor)}>{label}</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn('h-full transition-all duration-300 ease-out', bgColor)}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Password strength: ${label}`}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

