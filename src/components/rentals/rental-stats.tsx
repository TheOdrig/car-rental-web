'use client';

import { memo, type ReactNode } from 'react';
import { History, CalendarClock, Award } from 'lucide-react';
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
                isHighlighted && 'border-primary ring-1 ring-primary/20'
            )}
        >
            <CardContent className="flex items-center gap-4 px-4">
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                        isHighlighted
                            ? 'bg-primary/10 text-primary'
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
                            isHighlighted && 'text-primary'
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
                    'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
                    className
                )}
                aria-busy="true"
                aria-label="Loading rental statistics"
            >
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
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
            <StatCard
                icon={<Award className="h-6 w-6" />}
                label="Loyalty Points"
                value={stats.loyaltyPoints}
            />
        </div>
    );
});

export { RentalStats as default };
