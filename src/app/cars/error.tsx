'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export default function CarsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Cars page error:', error);
    }, [error]);

    return (
        <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Unable to load cars</h2>
            <p className="text-muted-foreground mb-6">
                We encountered an error while loading the car listings. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" asChild>
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        </div>
    );
}
