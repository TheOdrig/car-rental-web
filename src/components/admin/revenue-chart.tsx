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
                    {[...Array(6)].map((_, i) => (
                        <Skeleton
                            key={i}
                            className="flex-1"
                            style={{ height: `${Math.random() * 60 + 40}%` }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
