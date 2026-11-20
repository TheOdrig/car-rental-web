'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { StatCard } from '@/shared/ui/stat-card';
import { Skeleton } from '@/shared/ui/skeleton';
import { DollarSign, Car, Clock } from 'lucide-react';
import { formatCurrency } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

function MetricsCardSkeleton() {
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
            <StatCard
                label="Total Revenue"
                value={revenueValue}
                icon={DollarSign}
                trend={revenueTrend && { value: revenueTrend.value, isPositive: revenueTrend.direction === 'up', label: revenueTrend.label }}
                onClick={() => onCardClick?.('revenue')}
            />
            <StatCard
                label="Active Rentals"
                value={activeRentals}
                icon={Car}
                onClick={() => onCardClick?.('activeRentals')}
            />
            <StatCard
                label="Pending Approvals"
                value={pendingApprovals}
                icon={Clock}
                tone={pendingApprovals > 0 ? 'warning' : undefined}
                onClick={() => onCardClick?.('approvals')}
            />
        </div>
    );
}