'use client';

import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Breadcrumb } from '@/widgets/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/ui/stat-card';
import { useDamageStatistics } from '@/features/manage-damages';
import { DamageCurrencyTotals } from '@/entities/damage';

export function DamageStatisticsContent() {
    const router = useRouter();
    const { data: stats, isLoading } = useDamageStatistics();

    if (isLoading) {
        return <StatisticsSkeleton />;
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold">Failed to load statistics</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Damage Reports', href: '/admin/damages' },
                    { label: 'Statistics' },
                ]}
            />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Damage Statistics</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of damage reports and costs by currency
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Damages" value={stats.totalDamages} icon={AlertTriangle} hint="All time damage reports" />
            </div>

            <DamageCurrencyTotals totals={stats.byCurrency} />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>By Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-success" />
                                    <span>Minor</span>
                                </div>
                                <span className="font-medium">{stats.minorCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-warning" />
                                    <span>Moderate</span>
                                </div>
                                <span className="font-medium">{stats.moderateCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-destructive" />
                                    <span>Major</span>
                                </div>
                                <span className="font-medium">{stats.majorCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-destructive" />
                                    <span>Total Loss</span>
                                </div>
                                <span className="font-medium">{stats.totalLossCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>By Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning-subtle-foreground" />
                                    <span>Disputed</span>
                                </div>
                                <span className="font-medium">{stats.disputedCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-success-subtle-foreground" />
                                    <span>Resolved</span>
                                </div>
                                <span className="font-medium">{stats.resolvedCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatisticsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}
