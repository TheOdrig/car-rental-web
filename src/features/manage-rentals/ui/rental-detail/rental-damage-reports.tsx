'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDate } from '@/shared/lib';
import { DamageStatusBadge, useMyDamages } from '@/entities/damage';

interface RentalDamageReportsProps {
    rentalId: number;
}

export function RentalDamageReports({ rentalId }: RentalDamageReportsProps) {
    const { data } = useMyDamages(0, 100);
    const reports = (data?.content ?? []).filter((damage) => damage.rentalId === rentalId);

    if (reports.length === 0) {
        return null;
    }

    return (
        <Card data-testid="rental-damage-reports">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    Damage reports
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {reports.map((damage) => (
                    <Link
                        key={damage.id}
                        href={`/damages/${damage.id}`}
                        className="flex items-center justify-between gap-3 rounded-md border p-3 hover:bg-muted/50"
                    >
                        <span className="min-w-0 text-sm">
                            <span className="block font-medium">Report #{damage.id}</span>
                            <span className="block text-muted-foreground">{formatDate(damage.reportedAt)}</span>
                        </span>
                        <DamageStatusBadge status={damage.status} />
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
