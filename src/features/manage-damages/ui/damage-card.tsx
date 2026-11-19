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

interface DamageCardProps {
    damage: DamageReport;
    href?: string;
    onDispute?: (damage: DamageReport) => void;
}

export function DamageCard({ damage, href, onDispute }: DamageCardProps) {
    const canDispute = Boolean(onDispute) && damage.status === 'CHARGED';

    const summary = (
        <>
            <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                            <VehicleLabel carId={damage.carId} licensePlate={damage.carLicensePlate} />
                        </h3>
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
                                {formatCurrencyWithDecimals(damage.customerLiability, damage.currency ?? 'USD')}
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
                        aria-label={`Open damage report for ${damage.carLicensePlate}`}
                        className="flex items-start justify-between gap-4 rounded-md focus-visible:outline-none"
                    >
                        {summary}
                    </Link>
                ) : (
                    <div className="flex items-start justify-between gap-4">{summary}</div>
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