'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Auth error:', error);
    }, [error]);

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle>Something went wrong!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    An error occurred while loading the authentication page.
                </p>
                <Button onClick={() => reset()}>Try again</Button>
            </CardContent>
        </Card>
    );
}
