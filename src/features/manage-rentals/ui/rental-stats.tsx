'use client';

import { memo } from 'react';
import { History, CalendarClock } from 'lucide-react';
import { cn, formatNumber } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui/card';
import { StatCard } from '@/shared/ui/stat-card';
import { Skeleton } from '@/shared/ui/skeleton';
import type { RentalStats as RentalStatsType } from '@/entities/rental';

interface RentalStatsProps {
    stats: RentalStatsType;
    isLoading?: boolean;
    className?: string;
}

function StatCardSkeleton() {
    return (
        <Card className="py-4">
            <CardContent className="flex items-center gap-4 px-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-16" />
                </div>
            </CardContent>
        </Card>
    );
}

export const RentalStats = memo(function RentalStats({
    stats,
    isLoading,
    className,
}: RentalStatsProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    'grid gap-4 sm:grid-cols-2',
                    className
                )}
                aria-busy="true"
                aria-label="Loading rental statistics"
            >
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid gap-4 sm:grid-cols-2',
                className
            )}
            role="region"
            aria-label="Rental statistics"
        >
            <StatCard icon={History} label="Total Rentals" value={formatNumber(stats.totalRentals)} />
            <StatCard icon={CalendarClock} label="Active Trips" value={formatNumber(stats.activeTrips)} tone="success" />
        </div>
    );
});

export { RentalStats as default };
