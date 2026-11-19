'use client';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Rental } from '@/entities/rental';

interface DriverDetailsCardProps {
    userSummary: Rental['userSummary'];
    fullName?: string;
}

export function DriverDetailsCard({ userSummary, fullName }: DriverDetailsCardProps) {
    const email = userSummary?.email;
    const username = userSummary?.username;
    const name = fullName || userSummary?.fullName;

    if (!name && !username && !email) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" aria-hidden="true" />
                    Driver Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    {name && (
                        <div className="min-w-0">
                            <p className="mb-1 text-sm text-muted-foreground">Full Name</p>
                            <p className="break-words font-medium">{name}</p>
                        </div>
                    )}
                    {username && (
                        <div className="min-w-0">
                            <p className="mb-1 text-sm text-muted-foreground">Username</p>
                            <p className="break-all font-medium" data-testid="driver-username">{username}</p>
                        </div>
                    )}
                    {email && (
                        <div className="min-w-0">
                            <p className="mb-1 text-sm text-muted-foreground">Contact</p>
                            <p className="break-all font-medium">{email}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
