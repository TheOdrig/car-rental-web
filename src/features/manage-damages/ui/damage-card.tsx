'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { formatCurrencyWithDecimals, formatDate } from '@/shared/lib';
import { Skeleton } from '@/shared/ui/skeleton';
import { DamageStatusBadge, DamageSeverityBadge } from '@/entities/damage';
import { VehicleLabel } from '@/entities/car';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { DamageReport } from '@/entities/damage';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

interface DamageCardProps {
    damage: DamageReport;
    href?: string;
    onDispute?: (damage: DamageReport) => void;
}

export function DamageCard({ damage, href, onDispute }: DamageCardProps) {
    const canDispute = Boolean(onDispute) && damage.status === 'CHARGED';

    const summary = (
        <>
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="shrink-0 p-2 rounded-lg bg-warning-subtle">
                    <AlertTriangle className="h-5 w-5 text-warning-subtle-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="min-w-0 max-w-full truncate text-base font-medium">
                            <VehicleLabel carSummary={damage.carSummary} licensePlate={damage.carLicensePlate} />
                        </h2>
                        <DamageStatusBadge status={damage.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {damage.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                        <DamageSeverityBadge severity={damage.severity} />
                        <span className="text-muted-foreground">
                            {formatDate(damage.reportedAt)}
                        </span>
                    </div>
                    {damage.customerLiability !== undefined && damage.customerLiability > 0 && (
                        <p className="mt-2 text-sm font-medium">
                            Your Liability:{' '}
                            <span className="text-destructive">
                                {formatCurrencyWithDecimals(damage.customerLiability, damage.currency ?? DEFAULT_CURRENCY)}
                            </span>
                        </p>
                    )}
                </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </>
    );

    return (
        <Card className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardContent className="p-4">
                {href ? (
                    <Link
                        href={href}
                        className="flex min-w-0 items-start justify-between gap-4 rounded-md focus-visible:outline-none"
                    >
                        {summary}
                    </Link>
                ) : (
                    <div className="flex min-w-0 items-start justify-between gap-4">{summary}</div>
                )}
                {canDispute && (
                    <div className="mt-3 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => onDispute?.(damage)}>
                            Dispute Charge
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function DamageCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}