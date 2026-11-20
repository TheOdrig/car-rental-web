'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import type { StatusTone } from '@/shared/types';

interface StatCardTrend {
    value: number;
    isPositive: boolean;
    label?: string;
}

interface StatCardProps {
    label: string;
    value: ReactNode;
    icon?: ElementType;
    tone?: StatusTone;
    hint?: string;
    trend?: StatCardTrend;
    onClick?: () => void;
    className?: string;
}

const TONE_DOT: Record<StatusTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    info: 'bg-info',
    primary: 'bg-primary',
    neutral: 'bg-muted-foreground',
};

const TONE_ICON: Record<StatusTone, string> = {
    success: 'text-success-subtle-foreground',
    warning: 'text-warning-subtle-foreground',
    danger: 'text-danger-subtle-foreground',
    info: 'text-info-subtle-foreground',
    primary: 'text-primary-subtle-foreground',
    neutral: 'text-muted-foreground',
};

export function StatCard({ label, value, icon: Icon, tone, hint, trend, onClick, className }: StatCardProps) {
    const Root = onClick ? 'button' : 'div';

    return (
        <Root
            {...(onClick ? { type: 'button' as const, onClick } : {})}
            className={cn(
                'flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left shadow-sm',
                onClick && 'cursor-pointer transition-colors hover:border-primary/50',
                className
            )}
        >
            <div className="flex w-full items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    {tone && <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-full', TONE_DOT[tone])} />}
                    <span className="min-w-0 text-sm font-medium text-muted-foreground">{label}</span>
                </div>
                {Icon && (
                    <Icon
                        className={cn('mt-0.5 h-4 w-4 shrink-0', tone ? TONE_ICON[tone] : 'text-muted-foreground')}
                        aria-hidden="true"
                    />
                )}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
                <div className="min-w-0 text-2xl font-semibold tabular-nums text-foreground [overflow-wrap:anywhere]">{value}</div>
                {trend && (
                    <span
                        className={cn(
                            'text-xs font-medium',
                            trend.isPositive ? 'text-success-subtle-foreground' : 'text-danger-subtle-foreground'
                        )}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                        {trend.label && <span className="ml-1 font-normal text-muted-foreground">{trend.label}</span>}
                    </span>
                )}
            </div>
            {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
        </Root>
    );
}
