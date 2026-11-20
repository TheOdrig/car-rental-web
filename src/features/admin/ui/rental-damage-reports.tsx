'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDate } from '@/shared/lib';
import { DamageSeverityBadge, DamageStatusBadge, type DamageSeverity, type DamageStatus } from '@/entities/damage';

interface RentalDamageReport {
    id?: number;
    description?: string;
    reportedAt?: string;
    severity?: DamageSeverity;
    status?: DamageStatus;
}

interface RentalDamageReportsProps {
    damages: RentalDamageReport[];
}

export function RentalDamageReports({ damages }: RentalDamageReportsProps) {
    return (
        <Card data-testid="admin-rental-damage-reports">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    Damage reports
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {damages.map((damage) => (
                    <Link
                        key={damage.id}
                        href={`/admin/damages/${damage.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="min-w-0 text-sm">
                            <span className="block font-medium line-clamp-1">{damage.description || `Report #${damage.id}`}</span>
                            {damage.reportedAt && (
                                <span className="block text-xs text-muted-foreground">{formatDate(damage.reportedAt)}</span>
                            )}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                            {damage.severity && <DamageSeverityBadge severity={damage.severity} />}
                            {damage.status && <DamageStatusBadge status={damage.status} />}
                        </span>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
