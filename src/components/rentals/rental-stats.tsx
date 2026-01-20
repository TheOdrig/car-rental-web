'use client';

import { memo, type ReactNode } from 'react';
import { History, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RentalStats as RentalStatsType } from '@/types';

interface RentalStatsProps {
    stats: RentalStatsType;
    isLoading?: boolean;
    className?: string;
}

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: number;
    isHighlighted?: boolean;
}

function StatCard({ icon, label, value, isHighlighted }: StatCardProps) {
    return (
        <Card
            className={cn(
                'py-4 transition-all',
                isHighlighted && 'border-emerald-500/50 dark:border-emerald-400/50 ring-1 ring-emerald-500/20 dark:ring-emerald-400/30'
            )}
        >
            <CardContent className="flex items-center gap-4 px-4">
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                        isHighlighted
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                    )}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p
                        className={cn(
                            'text-2xl font-bold',
                            isHighlighted
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-foreground'
                        )}
                    >
                        {value.toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
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
            <StatCard
                icon={<History className="h-6 w-6" />}
                label="Total Rentals"
                value={stats.totalRentals}
            />
            <StatCard
                icon={<CalendarClock className="h-6 w-6" />}
                label="Active Trips"
                value={stats.activeTrips}
                isHighlighted
            />
        </div>
    );
});

export { RentalStats as default };
