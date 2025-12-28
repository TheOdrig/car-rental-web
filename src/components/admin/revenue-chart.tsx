'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/admin-utils';

import type { RevenueDataPoint, RevenuePeriod } from '@/types/admin';

interface RevenueChartProps {
    data: RevenueDataPoint[];
    period?: RevenuePeriod;
    onPeriodChange?: (period: RevenuePeriod) => void;
    isLoading?: boolean;
    className?: string;
    breakdown?: import('@/types/admin').RevenueBreakdown;
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
                : 'hsl(var(--muted-foreground) / 0.3)',
        }));
    }, [data]);

    const totalRevenue = useMemo(() => {
        return data.reduce((sum, item) => sum + item.revenue, 0);
    }, [data]);

    if (isLoading) {
        return <RevenueChartSkeleton className={className} />;
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-semibold">
                        Revenue Trends
                    </CardTitle>
                    <p className="text-2xl font-bold text-primary mt-1">
                        {formatCurrency(totalRevenue)}
                    </p>
                </div>
                <Select
                    value={currentPeriod}
                    onValueChange={(value) => handlePeriodChange(value as RevenuePeriod)}
                >
                    <SelectTrigger
                        className="w-[140px]"
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
                        aria-label={`Revenue chart showing ${data.length} months of data. Total revenue: ${formatCurrency(totalRevenue)}`}
                    >
                        <span className="sr-only">
                            Revenue breakdown by month: {data.map(d => `${d.month}: ${formatCurrency(d.revenue)}`).join(', ')}
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
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    className="text-xs"
                                    width={50}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, _name, item) => (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium">
                                                        {item.payload.month}
                                                    </span>
                                                    <span className="text-primary font-bold">
                                                        {formatCurrency(value as number)}
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
                                    className="transition-all duration-200"
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}

                {breakdown && (
                    <div className="mt-8 pt-6 border-t space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-muted-foreground font-medium">Rentals</span>
                                    <span className="font-bold">{formatCurrency(breakdown.rentalRevenue)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${breakdown.rentalPercentage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                                    {breakdown.rentalPercentage}% of total
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-muted-foreground font-medium">Penalties</span>
                                    <span className="font-bold">{formatCurrency(breakdown.penaltyRevenue)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${breakdown.penaltyPercentage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                                    {breakdown.penaltyPercentage}% of total
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-muted-foreground font-medium">Damages</span>
                                    <span className="font-bold">{formatCurrency(breakdown.damageCharges)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${breakdown.damagePercentage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                                    {breakdown.damagePercentage}% of total
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface RevenueChartSkeletonProps {
    className?: string;
}

export function RevenueChartSkeleton({ className }: RevenueChartSkeletonProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-9 w-[140px]" />
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex items-end gap-2 pt-4">
                    {[40, 70, 55, 85, 60, 75].map((height, i) => (
                        <Skeleton
                            key={i}
                            className="flex-1"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
