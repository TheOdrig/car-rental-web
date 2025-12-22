'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ClipboardCheck,
    Car,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    AlertTriangle,
    type LucideIcon,
} from 'lucide-react';


type MetricsCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface MetricsCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        direction: 'up' | 'down';
        label?: string;
    };
    variant?: MetricsCardVariant;
    className?: string;
    onClick?: () => void;
}

interface MetricsCardSkeletonProps {
    className?: string;
}


const variantStyles: Record<MetricsCardVariant, { bg: string; iconBg: string; iconColor: string }> = {
    default: {
        bg: 'border-border',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    success: {
        bg: 'border-green-200 dark:border-green-900',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    warning: {
        bg: 'border-amber-200 dark:border-amber-900',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
        bg: 'border-red-200 dark:border-red-900',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
    },
    info: {
        bg: 'border-blue-200 dark:border-blue-900',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
};


export const MetricsCard = memo(function MetricsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = 'default',
    className,
    onClick,
}: MetricsCardProps) {
    const styles = variantStyles[variant];

    return (
        <Card
            className={cn(
                'transition-all duration-200',
                styles.bg,
                onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                            {title}
                        </p>
                        <p className="text-3xl font-bold mt-2 tracking-tight">
                            {value}
                        </p>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend.direction === 'up' ? (
                                    <ArrowUpRight
                                        className="h-4 w-4 text-green-500"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <ArrowDownRight
                                        className="h-4 w-4 text-red-500"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    {trend.value}%
                                </span>
                                {trend.label && (
                                    <span className="text-sm text-muted-foreground">
                                        {trend.label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div
                            className={cn(
                                'flex-shrink-0 p-3 rounded-lg',
                                styles.iconBg
                            )}
                        >
                            <Icon
                                className={cn('h-6 w-6', styles.iconColor)}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});


export function MetricsCardSkeleton({ className }: MetricsCardSkeletonProps) {
    return (
        <Card className={cn('p-6', className)}>
            <CardContent className="p-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-9 w-16 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
            </CardContent>
        </Card>
    );
}


interface DashboardMetricsGridProps {
    pendingApprovals: number;
    todaysPickups: number;
    todaysReturns: number;
    overdueRentals: number;
    isLoading?: boolean;
    onCardClick?: (type: 'approvals' | 'pickups' | 'returns' | 'overdue') => void;
}

export function DashboardMetricsGrid({
    pendingApprovals,
    todaysPickups,
    todaysReturns,
    overdueRentals,
    isLoading = false,
    onCardClick,
}: DashboardMetricsGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
                <MetricsCardSkeleton />
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
                title="Pending Approvals"
                value={pendingApprovals}
                description="Awaiting admin review"
                icon={ClipboardCheck}
                variant={pendingApprovals > 0 ? 'warning' : 'default'}
                onClick={onCardClick ? () => onCardClick('approvals') : undefined}
            />
            <MetricsCard
                title="Today's Pickups"
                value={todaysPickups}
                description="Scheduled for today"
                icon={Car}
                variant="info"
                onClick={onCardClick ? () => onCardClick('pickups') : undefined}
            />
            <MetricsCard
                title="Today's Returns"
                value={todaysReturns}
                description="Expected returns"
                icon={Clock}
                variant="success"
                onClick={onCardClick ? () => onCardClick('returns') : undefined}
            />
            <MetricsCard
                title="Overdue Rentals"
                value={overdueRentals}
                description="Requires attention"
                icon={AlertTriangle}
                variant={overdueRentals > 0 ? 'danger' : 'default'}
                onClick={onCardClick ? () => onCardClick('overdue') : undefined}
            />
        </div>
    );
}
