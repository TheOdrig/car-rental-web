'use client';

import Link from 'next/link';
import { Clock, DollarSign, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib';

interface DashboardHeaderProps {
    lastUpdated: string | null;
    isRefreshing: boolean;
    isRefreshingRates: boolean;
    onRefresh: () => void;
    onRefreshRates: () => void;
}

export function DashboardHeader({
    lastUpdated,
    isRefreshing,
    isRefreshingRates,
    onRefresh,
    onRefreshRates,
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <p className="text-sm">Overview of your rental operations</p>
                    {lastUpdated && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-dashed border-slate-200 dark:border-slate-700">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            Updated {lastUpdated}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefreshRates}
                    disabled={isRefreshingRates}
                    className="gap-2 shrink-0 cursor-pointer bg-background border-border text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white"
                >
                    <DollarSign className={cn('h-4 w-4', isRefreshingRates && 'animate-pulse')} aria-hidden="true" />
                    {isRefreshingRates ? 'Refreshing...' : 'Refresh Rates'}
                </Button>
                <Button size="sm" className="gap-2 shrink-0 cursor-pointer" aria-label="Add new car to fleet" asChild>
                    <Link href="/admin/fleet/new">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add New Car
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    className="shrink-0 cursor-pointer"
                    aria-label={isRefreshing ? 'Refreshing data' : 'Refresh dashboard data'}
                >
                    <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}
