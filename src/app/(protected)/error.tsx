'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Protected page error:', error);
    }, [error]);

    return (
        <div className="container py-16">
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        We encountered an error while loading your dashboard.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => reset()}>Try again</Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Go home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}