'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin page error:', error);
    }, [error]);

    return (
        <div className="p-16">
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Admin Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        An error occurred in the admin panel. Please try again or contact support.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => reset()}>Try again</Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/dashboard">Back to Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
