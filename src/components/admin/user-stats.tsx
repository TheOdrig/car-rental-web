'use client';

import React, { memo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
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

interface StatCardConfig {
    title: string;
    key: keyof UserStatsData;
    icon: React.ElementType;
    dotColor: string;
    dotGlow: string;
    iconBg: string;
    iconColor: string;
}

const statCards: StatCardConfig[] = [
    {
        title: 'Total Users',
        key: 'totalUsers',
        icon: Users,
        dotColor: 'bg-slate-800 dark:bg-slate-400',
        dotGlow: 'shadow-[0_0_8px_rgba(30,41,59,0.5)]',
        iconBg: 'bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-slate-200/50 dark:group-hover:bg-slate-700/50',
        iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
        title: 'Active Users',
        key: 'activeUsers',
        icon: UserCheck,
        dotColor: 'bg-emerald-500',
        dotGlow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        iconBg: 'bg-emerald-100/50 dark:bg-emerald-900/30 group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-900/50',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        title: 'Banned Users',
        key: 'bannedUsers',
        icon: UserX,
        dotColor: 'bg-red-500',
        dotGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        iconBg: 'bg-red-100/50 dark:bg-red-900/30 group-hover:bg-red-200/50 dark:group-hover:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
    },
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
        <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
            {statCards.map((card) => {
                const Icon = card.icon;
                const value = data[card.key] ?? 0;
                const showSubtitle = card.key === 'activeUsers';

                return (
                    <div
                        key={card.key}
                        className={cn(
                            'group relative flex flex-col p-5 rounded-2xl',
                            'bg-white/60 dark:bg-slate-800/40',
                            'backdrop-blur-xl',
                            'border border-white/40 dark:border-white/10',
                            'shadow-lg hover:shadow-xl',
                            'transition-all duration-200 hover:-translate-y-0.5'
                        )}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className={cn('w-2 h-2 rounded-full', card.dotColor, card.dotGlow)} />
                                <span className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                    {card.title}
                                </span>
                            </div>
                            <div className={cn(
                                'p-2 rounded-lg backdrop-blur-md transition-colors',
                                card.iconBg
                            )}>
                                <Icon className={cn('h-5 w-5', card.iconColor)} aria-hidden="true" />
                            </div>
                        </div>
                        <div className="mt-auto">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                {value}
                            </span>
                            {showSubtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {activePercentage}% of total
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

function UserStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-2 w-2 rounded-full" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>
    );
}

export { UserStatsCardsSkeleton };
