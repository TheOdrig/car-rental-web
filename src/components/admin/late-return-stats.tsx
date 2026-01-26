'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    AlertTriangle,
    DollarSign,
    CheckCircle,
    Timer,
    TrendingUp,
    Percent,
} from 'lucide-react';
import type { LateReturnStatistics } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface LateReturnStatsProps {
    data?: LateReturnStatistics;
    isLoading?: boolean;
}

export function LateReturnStats({ data, isLoading }: LateReturnStatsProps) {
    if (isLoading) {
        return <LateReturnStatsSkeleton />;
    }

    if (!data) {
        return null;
    }

    const stats = [
        {
            label: 'Total Late Returns',
            value: data.totalLateReturns.toString(),
            icon: Clock,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            label: 'Severely Late',
            value: data.severelyLateCount.toString(),
            icon: AlertTriangle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
        },
        {
            label: 'Total Penalties',
            value: formatCurrency(data.totalPenaltyAmount, 'USD'),
            icon: DollarSign,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        },
        {
            label: 'Collected',
            value: formatCurrency(data.collectedPenaltyAmount, 'USD'),
            icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
        },
        {
            label: 'Pending',
            value: formatCurrency(data.pendingPenaltyAmount, 'USD'),
            icon: Timer,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        },
        {
            label: 'Avg. Late Hours',
            value: `${data.averageLateHours.toFixed(1)}h`,
            icon: TrendingUp,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            label: 'Late Return Rate',
            value: `${data.lateReturnPercentage.toFixed(1)}%`,
            icon: Percent,
            color: 'text-slate-600 dark:text-slate-400',
            bgColor: 'bg-slate-100 dark:bg-slate-800',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function LateReturnStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
                <Card
                    key={i}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

