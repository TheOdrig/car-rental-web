'use client';

import React, { memo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/ui/stat-card';
import type { StatusTone } from '@/shared/types';
import { cn } from '@/shared/lib';
import type { UserStats } from '../model/types';

interface UserStatsCardsProps {
    data: UserStats;
    isLoading?: boolean;
    className?: string;
}

interface StatCardConfig {
    title: string;
    key: keyof UserStats;
    icon: React.ElementType;
    tone: StatusTone;
}

const statCards: StatCardConfig[] = [
    { title: 'Total Users', key: 'totalUsers', icon: Users, tone: 'neutral' },
    { title: 'Active Users', key: 'activeUsers', icon: UserCheck, tone: 'success' },
    { title: 'Banned Users', key: 'bannedUsers', icon: UserX, tone: 'danger' },
];

export const UserStatsCards = memo(function UserStatsCards({
    data,
    isLoading = false,
    className,
}: UserStatsCardsProps) {
    if (isLoading) {
        return <UserStatsCardsSkeleton className={className} />;
    }

    const { totalUsers, activeUsers } = data;
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    return (
        <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
            {statCards.map((card) => (
                <StatCard
                    key={card.key}
                    label={card.title}
                    value={data[card.key] ?? 0}
                    icon={card.icon}
                    tone={card.tone}
                    hint={card.key === 'activeUsers' ? `${activePercentage}% of total` : undefined}
                />
            ))}
        </div>
    );
});

function UserStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <Skeleton className="mb-3 h-4 w-24" />
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>
    );
}

export { UserStatsCardsSkeleton };
