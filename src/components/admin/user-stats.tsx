'use client';

import React, { memo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface UserStatsData {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
}

interface UserStatsCardsProps {
    data: UserStatsData;
    isLoading?: boolean;
    className?: string;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    variant?: 'default' | 'success' | 'danger';
    subtitle?: string;
}

const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
};

const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

function StatCard({ title, value, icon, variant = 'default', subtitle }: StatCardProps) {
    return (
        <Card className={cn('transition-all duration-200 hover:shadow-md', variantStyles[variant])}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn('rounded-xl p-3', iconStyles[variant])}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export const UserStatsCards = memo(function UserStatsCards({
    data,
    isLoading = false,
    className,
}: UserStatsCardsProps) {
    if (isLoading) {
        return <UserStatsCardsSkeleton className={className} />;
    }

    const { totalUsers, activeUsers, bannedUsers } = data;
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    return (
        <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
            <StatCard
                title="Total Users"
                value={totalUsers}
                icon={<Users className="h-6 w-6" aria-hidden="true" />}
                variant="default"
            />
            <StatCard
                title="Active Users"
                value={activeUsers}
                icon={<UserCheck className="h-6 w-6" aria-hidden="true" />}
                variant="success"
                subtitle={`${activePercentage}% of total`}
            />
            <StatCard
                title="Banned Users"
                value={bannedUsers}
                icon={<UserX className="h-6 w-6" aria-hidden="true" />}
                variant="danger"
            />
        </div>
    );
});

function UserStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
            {[...Array(3)].map((_, i) => (
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

export { UserStatsCardsSkeleton };
