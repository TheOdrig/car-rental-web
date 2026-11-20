'use client';

import React, { memo } from 'react';
import { Car, Route, Wrench, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
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
    icon: React.ElementType;
    dotColor: string;
}

const statCards: StatCardConfig[] = [
    { title: 'Total', key: 'totalCars', icon: Car, dotColor: 'bg-slate-500' },
    { title: 'Available', key: 'availableCars', icon: CheckCircle, dotColor: 'bg-emerald-500' },
    { title: 'Rented', key: 'rentedCars', icon: Route, dotColor: 'bg-blue-500' },
    { title: 'Reserved', key: 'reservedCars', icon: Clock, dotColor: 'bg-violet-500' },
    { title: 'Maintenance', key: 'maintenanceCars', icon: Wrench, dotColor: 'bg-amber-500' },
    { title: 'Inspection', key: 'inspectionCars', icon: Eye, dotColor: 'bg-cyan-500' },
    { title: 'Damaged', key: 'damagedCars', icon: AlertTriangle, dotColor: 'bg-red-500' },
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
                    icon={card.icon}
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
