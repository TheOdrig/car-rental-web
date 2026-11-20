'use client';

import { memo } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/ui/stat-card';
import type { StatusTone } from '@/shared/types';
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
    tone: StatusTone;
}

const statCards: StatCardConfig[] = [
    { title: 'Total', key: 'totalCars', tone: 'neutral' },
    { title: 'Available', key: 'availableCars', tone: 'success' },
    { title: 'Rented', key: 'rentedCars', tone: 'info' },
    { title: 'Reserved', key: 'reservedCars', tone: 'primary' },
    { title: 'Maintenance', key: 'maintenanceCars', tone: 'warning' },
    { title: 'Inspection', key: 'inspectionCars', tone: 'neutral' },
    { title: 'Damaged', key: 'damagedCars', tone: 'danger' },
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
                <StatCard
                    key={card.key}
                    label={card.title}
                    value={(data[card.key] ?? 0) as number}
                    tone={card.tone}
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
