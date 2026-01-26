'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Car, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
    title: string;
    value: string | number;
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
                'transition-all duration-200 hover:shadow-lg',
                onClick && 'cursor-pointer hover:scale-[1.02]',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {trend && (
                            <div className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
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
                    <div className="rounded-full bg-primary/10 p-3">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function MetricsCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}

interface DashboardMetricsGridProps {
    totalRevenue?: number;
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
    totalRevenue = 0,
    revenueTrend,
    activeRentals = 0,
    pendingApprovals = 0,
    isLoading = false,
    onCardClick,
}: DashboardMetricsGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
                title="Total Revenue"
                value={formatCurrency(totalRevenue)}
                icon={<DollarSign className="h-5 w-5 text-primary" />}
                trend={revenueTrend}
                onClick={() => onCardClick?.('revenue')}
            />
            <MetricsCard
                title="Active Rentals"
                value={activeRentals}
                icon={<Car className="h-5 w-5 text-primary" />}
                onClick={() => onCardClick?.('activeRentals')}
            />
            <MetricsCard
                title="Pending Approvals"
                value={pendingApprovals}
                icon={<Clock className="h-5 w-5 text-primary" />}
                onClick={() => onCardClick?.('approvals')}
                className={pendingApprovals > 0 ? 'border-amber-500/50' : undefined}
            />
        </div>
    );
}

