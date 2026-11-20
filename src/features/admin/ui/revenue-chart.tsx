'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { RevenueChartSkeleton } from './revenue-chart-skeleton';
import { niceAxisTicks } from '../lib/utils';
import { cn } from '@/shared/lib';
import { formatCompactCurrency, formatCurrency } from '@/shared/lib';

import type { RevenueBreakdown, RevenueCurrency, RevenueDataPoint, RevenuePeriod } from '../model/types';

interface RevenueChartProps {
    data: RevenueDataPoint[];
    period?: RevenuePeriod;
    onPeriodChange?: (period: RevenuePeriod) => void;
    isLoading?: boolean;
    className?: string;
    breakdown?: RevenueBreakdown;
    currency: RevenueCurrency;
}

const chartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'var(--chart-1)',
    },
    currentRevenue: {
        label: 'Current Month',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function RevenueChart({
    data,
    period = 'last6months',
    onPeriodChange,
    isLoading = false,
    className,
    breakdown,
    currency,
}: RevenueChartProps) {
    const [internalPeriod, setInternalPeriod] = useState<RevenuePeriod>(period);

    const currentPeriod = onPeriodChange ? period : internalPeriod;

    const handlePeriodChange = (value: RevenuePeriod) => {
        if (onPeriodChange) {
            onPeriodChange(value);
        } else {
            setInternalPeriod(value);
        }
    };

    const processedData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            fill: item.isCurrent
                ? 'hsl(var(--primary))'
                : 'hsl(var(--primary) / 0.5)',
        }));
    }, [data]);

    const axisTicks = useMemo(() => niceAxisTicks(Math.max(0, ...data.map((item) => item.revenue))), [data]);

    const money = (value: number) => formatCurrency(value, currency);

    const totalRevenue = useMemo(() => {
        return data.reduce((sum, item) => sum + item.revenue, 0);
    }, [data]);

    if (isLoading) {
        return <RevenueChartSkeleton className={className} />;
    }

    return (
        <Card className={cn('min-w-0', className)}>
            <CardHeader className="flex flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:items-center">
                <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold">
                        Revenue Trends ({currency})
                    </CardTitle>
                    <p className="text-2xl font-bold text-foreground mt-1">
                        {money(totalRevenue)}
                    </p>
                </div>
                <Select
                    value={currentPeriod}
                    onValueChange={(value) => handlePeriodChange(value as RevenuePeriod)}
                >
                    <SelectTrigger
                        className="w-[140px] bg-background border-border hover:bg-accent transition-colors cursor-pointer text-foreground"
                        aria-label="Select time period"
                    >
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="last6months">Last 6 Months</SelectItem>
                        <SelectItem value="lastyear">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No revenue data available
                    </div>
                ) : (
                    <div
                        role="img"
                        aria-label={`Revenue chart in ${currency} showing ${data.length} months of data. Total revenue: ${money(totalRevenue)}`}
                    >
                        <span className="sr-only">
                            Revenue breakdown by month: {data.map(d => `${d.month}: ${money(d.revenue)}`).join(', ')}
                        </span>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart
                                data={processedData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    className="text-xs"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value: number) => formatCompactCurrency(value, currency)}
                                    className="text-xs"
                                    width={55}
                                    domain={[0, axisTicks[axisTicks.length - 1]]}
                                    ticks={axisTicks}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, _name, item) => (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium">
                                                        {item.payload.month}
                                                    </span>
                                                    <span className="text-primary font-bold">
                                                        {money(value as number)}
                                                    </span>
                                                    {item.payload.isCurrent && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Current Month
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            hideLabel
                                            hideIndicator
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="revenue"
                                    radius={[4, 4, 0, 0]}
                                    className="transition-all duration-200 fill-primary"
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}

                {breakdown && (
                    <div className="mt-8 pt-6 border-t space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-muted-foreground font-medium">Rentals</span>
                                    <span className="font-bold">{money(breakdown.rentalRevenue)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(breakdown.rentalPercentage, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                                    {breakdown.rentalPercentage.toFixed(1)}% of gross
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-muted-foreground font-medium">Penalties</span>
                                    <span className="font-bold">{money(breakdown.penaltyRevenue)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-warning rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(breakdown.penaltyPercentage, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                                    {breakdown.penaltyPercentage.toFixed(1)}% of gross
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-raised p-4 space-y-3">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                Damage Summary
                            </h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Recovered</p>
                                    <p className="text-sm font-bold text-success-subtle-foreground">
                                        +{money(breakdown.damageRecovered)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Repair Costs</p>
                                    <p className="text-sm font-bold text-danger-subtle-foreground">
                                        -{money(breakdown.damageRepairCosts)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Net Impact</p>
                                    <p className={`text-sm font-bold ${breakdown.netDamageImpact >= 0 ? 'text-success-subtle-foreground' : 'text-danger-subtle-foreground'}`}>
                                        {breakdown.netDamageImpact >= 0 ? '+' : ''}{money(breakdown.netDamageImpact)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                            <span className="text-sm font-semibold text-muted-foreground">Net Revenue</span>
                            <span className={`text-lg font-bold ${breakdown.netRevenue >= 0 ? 'text-success-subtle-foreground' : 'text-danger-subtle-foreground'}`}>
                                {money(breakdown.netRevenue)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
