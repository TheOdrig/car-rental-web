'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
    Clock,
    AlertTriangle,
    DollarSign,
    CheckCircle,
    Timer,
    TrendingUp,
    Percent,
} from 'lucide-react';
import type { LateReturnStatistics } from '@/entities/rental';
import { formatCurrency } from '@/shared/lib';

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
            color: 'text-info-subtle-foreground',
            bgColor: 'bg-info-subtle',
        },
        {
            label: 'Severely Late',
            value: data.severelyLateCount.toString(),
            icon: AlertTriangle,
            color: 'text-danger-subtle-foreground',
            bgColor: 'bg-danger-subtle',
        },
        {
            label: 'Avg. Late Hours',
            value: `${data.averageLateHours.toFixed(1)}h`,
            icon: TrendingUp,
            color: 'text-info-subtle-foreground',
            bgColor: 'bg-info-subtle',
        },
        {
            label: 'Late Return Rate',
            value: `${data.lateReturnPercentage.toFixed(1)}%`,
            icon: Percent,
            color: 'text-muted-foreground',
            bgColor: 'bg-muted',
        },
    ];

    const penalties = (data.penaltiesByCurrency ?? []).flatMap((entry) => {
        const currency = entry.currency;
        if (!currency) return [];
        return [
            {
                label: `Total Penalties (${currency})`,
                value: formatCurrency(entry.totalPenaltyAmount ?? 0, currency),
                icon: DollarSign,
                color: 'text-warning-subtle-foreground',
                bgColor: 'bg-warning-subtle',
            },
            {
                label: `Collected (${currency})`,
                value: formatCurrency(entry.collectedPenaltyAmount ?? 0, currency),
                icon: CheckCircle,
                color: 'text-success-subtle-foreground',
                bgColor: 'bg-success-subtle',
            },
            {
                label: `Pending (${currency})`,
                value: formatCurrency(entry.pendingPenaltyAmount ?? 0, currency),
                icon: Timer,
                color: 'text-warning-subtle-foreground',
                bgColor: 'bg-warning-subtle',
            },
        ];
    });

    return (
        <div className="space-y-4">
            <StatGrid stats={stats} columns="grid-cols-2 md:grid-cols-4" />
            {penalties.length > 0 && <StatGrid stats={penalties} columns="grid-cols-1 sm:grid-cols-3" />}
        </div>
    );
}

interface StatItem {
    label: string;
    value: string;
    icon: typeof Clock;
    color: string;
    bgColor: string;
}

function StatGrid({ stats, columns }: { stats: StatItem[]; columns: string }) {
    return (
        <div className={`grid ${columns} gap-4`}>
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className="bg-card border-border"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card
                    key={i}
                    className="bg-card border-border"
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