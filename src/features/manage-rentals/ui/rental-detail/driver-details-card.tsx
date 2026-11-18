'use client';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Rental } from '@/entities/rental';

interface DriverDetailsCardProps {
    userSummary: Rental['userSummary'];
}

export function DriverDetailsCard({ userSummary }: DriverDetailsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" aria-hidden="true" />
                    Driver Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="min-w-0">
                        <p className="mb-1 text-sm text-muted-foreground">Full Name</p>
                        <p className="break-words font-medium">{userSummary?.username}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-sm text-muted-foreground">License Number</p>
                        <p className="font-medium">••••••1234</p>
                    </div>
                    <div className="min-w-0">
                        <p className="mb-1 text-sm text-muted-foreground">Contact</p>
                        <p className="break-all font-medium">{userSummary?.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
