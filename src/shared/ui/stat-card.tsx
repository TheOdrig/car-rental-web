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
                'min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
                {Icon && <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="min-w-0 text-2xl font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-slate-100">{value}</p>
                {trend && (
                    <span
                        className={cn(
                            'text-xs font-medium',
                            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}
