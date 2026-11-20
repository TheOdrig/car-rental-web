'use client';

import { cn } from '@/shared/lib';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    className?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatCard({ label, value, icon: Icon, className, trend }: StatCardProps) {
    return (
        <div
            className={cn(
                'min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm',
                className
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-medium text-muted-foreground">{label}</p>
                {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="min-w-0 text-2xl font-semibold text-foreground [overflow-wrap:anywhere]">{value}</p>
                {trend && (
                    <span
                        className={cn(
                            'text-xs font-medium',
                            trend.isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                        )}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}
