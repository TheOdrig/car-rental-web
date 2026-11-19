'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface SegmentErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
}

export function SegmentError({
    error,
    reset,
    title = 'Something went wrong',
    description = 'This page could not be loaded. Try again, or go back.',
    backHref = '/',
    backLabel = 'Go home',
}: SegmentErrorProps) {
    useEffect(() => {
        console.error('Segment error:', error);
    }, [error]);

    return (
        <div role="alert" className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>
            )}
            <div className="mt-6 flex gap-3">
                <Button onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Try again
                </Button>
                <Button variant="outline" asChild>
                    <Link href={backHref}>{backLabel}</Link>
                </Button>
            </div>
        </div>
    );
}
