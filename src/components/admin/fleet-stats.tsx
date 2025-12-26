'use client';

import React, { memo } from 'react';
import { Car, Route, Wrench, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FleetStatus } from '@/types/admin';

interface FleetStatsCardsProps {
    data: FleetStatus;
    isLoading?: boolean;
    className?: string;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
    variant?: 'default' | 'success' | 'warning' | 'danger';
    pulse?: boolean;
}

const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
};

const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

function StatCard({ title, value, icon, trend, variant = 'default', pulse = false }: StatCardProps) {
    return (
        <Card className={cn('transition-all duration-200 hover:shadow-md', variantStyles[variant])}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold tabular-nums">{value}</p>
                        {trend && (
                            <div className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trend.direction === 'up' ? (
                                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" aria-hidden="true" />
                                )}
                                <span>{trend.value}% vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className={cn(
                        'rounded-xl p-3',
                        iconStyles[variant],
                        pulse && 'animate-pulse'
                    )}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export const FleetStatsCards = memo(function FleetStatsCards({
    data,
    isLoading = false,
    className,
}: FleetStatsCardsProps) {
    if (isLoading) {
        return <FleetStatsCardsSkeleton className={className} />;
    }

    const { totalCars, rentedCars, maintenanceCars, damagedCars } = data;

    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
            <StatCard
                title="Total Cars"
                value={totalCars}
                icon={<Car className="h-6 w-6" aria-hidden="true" />}
                variant="default"
            />
            <StatCard
                title="On Road"
                value={rentedCars}
                icon={<Route className="h-6 w-6" aria-hidden="true" />}
                variant="success"
                pulse={rentedCars > 0}
            />
            <StatCard
                title="In Maintenance"
                value={maintenanceCars}
                icon={<Wrench className="h-6 w-6" aria-hidden="true" />}
                variant="warning"
            />
            <StatCard
                title="Damaged"
                value={damagedCars}
                icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
                variant="danger"
            />
        </div>
    );
});

function FleetStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export { FleetStatsCardsSkeleton };
