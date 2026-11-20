'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function LateReturnsError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[Late Returns] Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-danger-subtle p-4 mb-4">
                <AlertTriangle className="h-8 w-8 text-danger-subtle-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
                We encountered an error while loading late returns data.
                Please try again or contact support if the problem persists.
            </p>
            <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
            </Button>
        </div>
    );
}
