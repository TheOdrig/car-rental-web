'use client';

import { useId } from 'react';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface CancelReasonFieldProps {
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    error?: string;
    disabled?: boolean;
}

export function CancelReasonField({ value, onChange, maxLength, error, disabled }: CancelReasonFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const overLimit = value.length > maxLength;
    const message = error ?? (overLimit ? `The reason can be at most ${maxLength} characters.` : undefined);

    return (
        <div className="space-y-2 pt-2 text-left">
            <Label htmlFor={id}>Reason (optional)</Label>
            <Textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                placeholder="Tell the customer why this rental is being cancelled"
                aria-invalid={message ? true : undefined}
                aria-describedby={message ? errorId : undefined}
                className="min-h-[88px]"
            />
            <div className="flex items-start justify-between gap-2 text-xs">
                <p id={errorId} role={message ? 'alert' : undefined} className="text-destructive">
                    {message}
                </p>
                <span className={overLimit ? 'text-destructive' : 'text-muted-foreground'}>
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
