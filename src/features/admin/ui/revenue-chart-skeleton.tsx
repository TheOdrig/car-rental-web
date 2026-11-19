'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib';

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
