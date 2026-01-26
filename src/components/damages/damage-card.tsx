'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DamageStatusBadge, DamageSeverityBadge } from '@/components/admin';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { DamageReport } from '@/types';

interface DamageCardProps {
    damage: DamageReport;
    onClick?: () => void;
}

export function DamageCard({ damage, onClick }: DamageCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate">{damage.carLicensePlate}</h3>
                                <DamageStatusBadge status={damage.status} />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {damage.description}
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                                <DamageSeverityBadge severity={damage.severity} />
                                <span className="text-muted-foreground">
                                    {new Date(damage.reportedAt).toLocaleDateString()}
                                </span>
                            </div>
                            {damage.customerLiability !== undefined && damage.customerLiability > 0 && (
                                <p className="mt-2 text-sm font-medium">
                                    Your Liability: <span className="text-destructive">${damage.customerLiability.toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
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

