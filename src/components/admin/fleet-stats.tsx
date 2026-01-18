'use client';

import React, { memo } from 'react';
import { Car, Route, Wrench, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FleetStatus } from '@/types/admin';

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
    dotGlow: string;
    iconBg: string;
    iconColor: string;
}

const statCards: StatCardConfig[] = [
    {
        title: 'Total',
        key: 'totalCars',
        icon: Car,
        dotColor: 'bg-slate-800 dark:bg-slate-400',
        dotGlow: 'shadow-[0_0_8px_rgba(30,41,59,0.5)]',
        iconBg: 'bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-slate-200/50 dark:group-hover:bg-slate-700/50',
        iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
        title: 'Available',
        key: 'availableCars',
        icon: CheckCircle,
        dotColor: 'bg-emerald-500',
        dotGlow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        iconBg: 'bg-emerald-100/50 dark:bg-emerald-900/30 group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-900/50',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        title: 'Rented',
        key: 'rentedCars',
        icon: Route,
        dotColor: 'bg-purple-500',
        dotGlow: 'shadow-[0_0_8px_rgba(168,85,247,0.6)]',
        iconBg: 'bg-purple-100/50 dark:bg-purple-900/30 group-hover:bg-purple-200/50 dark:group-hover:bg-purple-900/50',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        title: 'Reserved',
        key: 'reservedCars',
        icon: Clock,
        dotColor: 'bg-blue-500',
        dotGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
        iconBg: 'bg-blue-100/50 dark:bg-blue-900/30 group-hover:bg-blue-200/50 dark:group-hover:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        title: 'Maint.',
        key: 'maintenanceCars',
        icon: Wrench,
        dotColor: 'bg-orange-500',
        dotGlow: 'shadow-[0_0_8px_rgba(249,115,22,0.6)]',
        iconBg: 'bg-orange-100/50 dark:bg-orange-900/30 group-hover:bg-orange-200/50 dark:group-hover:bg-orange-900/50',
        iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        title: 'Inspect',
        key: 'inspectionCars',
        icon: Eye,
        dotColor: 'bg-cyan-500',
        dotGlow: 'shadow-[0_0_8px_rgba(6,182,212,0.6)]',
        iconBg: 'bg-cyan-100/50 dark:bg-cyan-900/30 group-hover:bg-cyan-200/50 dark:group-hover:bg-cyan-900/50',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
        title: 'Damaged',
        key: 'damagedCars',
        icon: AlertTriangle,
        dotColor: 'bg-red-500',
        dotGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        iconBg: 'bg-red-100/50 dark:bg-red-900/30 group-hover:bg-red-200/50 dark:group-hover:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
    },
];

export const FleetStatsCards = memo(function FleetStatsCards({
    data,
    isLoading = false,
    className,
}: FleetStatsCardsProps) {
    if (isLoading) {
        return <FleetStatsCardsSkeleton className={className} />;
    }

    return (
        <div className={cn('grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7', className)}>
            {statCards.map((card) => {
                const Icon = card.icon;
                const value = data[card.key] ?? 0;

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
                                {value as number}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

function FleetStatsCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7', className)}>
            {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-2 w-2 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>
    );
}

export { FleetStatsCardsSkeleton };
