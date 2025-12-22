'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-4 text-muted-foreground max-w-md">
                We apologize for the inconvenience. An unexpected error has occurred.
                Please try again or contact support if the problem persists.
            </p>
            {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                </p>
            )}
            <div className="mt-8 flex gap-4">
                <Button onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button variant="outline" asChild>
                    <a href="/">Go Home</a>
                </Button>
            </div>
        </div>
    );
}
