'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib';

interface CopyButtonProps {
    value: string;
    className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Failed to copy to clipboard');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn('h-6 w-6', className)}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
            {copied ? (
                <Check className="h-3 w-3 text-success" />
            ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
            )}
        </Button>
    );
}
