'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { DollarSign, Car, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

interface MetricsCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    trend?: {
        value: number;
        direction: 'up' | 'down';
        label: string;
    };
    onClick?: () => void;
    className?: string;
}

export function MetricsCard({
    title,
    value,
    icon,
    trend,
    onClick,
    className,
}: MetricsCardProps) {
    return (
        <Card
            className={cn(
                'gap-0 py-0 transition-colors',
                onClick && 'cursor-pointer hover:border-primary/50',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-semibold tabular-nums">{value}</p>
                        {trend && (
                            <div className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                trend.direction === 'up' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                            )}>
                                {trend.direction === 'up' ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{trend.value}%</span>
                                <span className="text-muted-foreground">{trend.label}</span>
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 text-muted-foreground">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

export function MetricsCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    );
}

interface DashboardMetricsGridProps {
    revenueByCurrency?: { currency: string; totalRevenue: number }[];
    revenueTrend?: {
        value: number;
        direction: 'up' | 'down';
        label: string;
    };
    activeRentals?: number;
    pendingApprovals?: number;
    isLoading?: boolean;
    onCardClick?: (type: 'revenue' | 'activeRentals' | 'approvals') => void;
}

export function DashboardMetricsGrid({
    revenueByCurrency = [],
    revenueTrend,
    activeRentals = 0,
    pendingApprovals = 0,
    isLoading = false,
    onCardClick,
}: DashboardMetricsGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
            </div>
        );
    }

    const revenueValue = revenueByCurrency.length === 0
        ? formatCurrency(0, DEFAULT_CURRENCY)
        : revenueByCurrency.map((entry) => (
            <span key={entry.currency} className="block">
                {formatCurrency(entry.totalRevenue, entry.currency)}
            </span>
        ));

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
                title="Total Revenue"
                value={revenueValue}
                icon={<DollarSign className="h-4 w-4" aria-hidden="true" />}
                trend={revenueTrend}
                onClick={() => onCardClick?.('revenue')}
            />
            <MetricsCard
                title="Active Rentals"
                value={activeRentals}
                icon={<Car className="h-4 w-4" aria-hidden="true" />}
                onClick={() => onCardClick?.('activeRentals')}
            />
            <MetricsCard
                title="Pending Approvals"
                value={pendingApprovals}
                icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                onClick={() => onCardClick?.('approvals')}
                className={pendingApprovals > 0 ? 'border-amber-500/60' : undefined}
            />
        </div>
    );
}