'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { StatCard } from '@/shared/ui/stat-card';
import type { StatusTone } from '@/shared/types';
import { Skeleton } from '@/shared/ui/skeleton';
import {
    Clock,
    AlertTriangle,
    DollarSign,
    CheckCircle,
    Timer,
    TrendingUp,
    Percent,
    type LucideIcon,
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

    const stats: StatItem[] = [
        {
            label: 'Total Late Returns',
            value: data.totalLateReturns.toString(),
            icon: Clock,
            tone: 'info',
        },
        {
            label: 'Severely Late',
            value: data.severelyLateCount.toString(),
            icon: AlertTriangle,
            tone: 'danger',
        },
        {
            label: 'Avg. Late Hours',
            value: `${data.averageLateHours.toFixed(1)}h`,
            icon: TrendingUp,
            tone: 'info',
        },
        {
            label: 'Late Return Rate',
            value: `${data.lateReturnPercentage.toFixed(1)}%`,
            icon: Percent,
            tone: 'neutral',
        },
    ];

    const penalties: StatItem[] = (data.penaltiesByCurrency ?? []).flatMap((entry) => {
        const currency = entry.currency;
        if (!currency) return [];
        return [
            {
                label: `Total Penalties (${currency})`,
                value: formatCurrency(entry.totalPenaltyAmount ?? 0, currency),
                icon: DollarSign,
                tone: 'warning',
            },
            {
                label: `Collected (${currency})`,
                value: formatCurrency(entry.collectedPenaltyAmount ?? 0, currency),
                icon: CheckCircle,
                tone: 'success',
            },
            {
                label: `Pending (${currency})`,
                value: formatCurrency(entry.pendingPenaltyAmount ?? 0, currency),
                icon: Timer,
                tone: 'warning',
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
    icon: LucideIcon;
    tone: StatusTone;
}

function StatGrid({ stats, columns }: { stats: StatItem[]; columns: string }) {
    return (
        <div className={`grid ${columns} gap-4`}>
            {stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
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