'use client';

import { memo } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatTile } from '@/shared/ui/stat-tile';
import { cn } from '@/shared/lib';
import type { FleetStatus } from '@/entities/car';

interface FleetStatsCardsProps {
    data: FleetStatus;
    isLoading?: boolean;
    className?: string;
}

interface StatCardConfig {
    title: string;
    key: keyof FleetStatus;
    dotColor: string;
}

const statCards: StatCardConfig[] = [
    { title: 'Total', key: 'totalCars', dotColor: 'bg-muted-foreground' },
    { title: 'Available', key: 'availableCars', dotColor: 'bg-success' },
    { title: 'Rented', key: 'rentedCars', dotColor: 'bg-info' },
    { title: 'Reserved', key: 'reservedCars', dotColor: 'bg-info' },
    { title: 'Maintenance', key: 'maintenanceCars', dotColor: 'bg-warning' },
    { title: 'Inspection', key: 'inspectionCars', dotColor: 'bg-info' },
    { title: 'Damaged', key: 'damagedCars', dotColor: 'bg-destructive' },
];

const GRID = 'grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7';

export const FleetStatsCards = memo(function FleetStatsCards({
    data,
    isLoading = false,
    className,
}: FleetStatsCardsProps) {
    if (isLoading) {
        return <FleetStatsCardsSkeleton className={className} />;
    }

    return (
        <div className={cn(GRID, className)}>
            {statCards.map((card) => (
                <StatTile
                    key={card.key}
                    label={card.title}
                    value={(data[card.key] ?? 0) as number}
                    dotClassName={card.dotColor}
                />
            ))}
        </div>
    );
});

function FleetStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(GRID, className)}>
            {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <Skeleton className="mb-3 h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>
    );
}

export { FleetStatsCardsSkeleton };
