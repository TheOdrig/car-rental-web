'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, CheckCircle, Settings, AlertTriangle, PieChart } from 'lucide-react';
import type { FleetStatus as FleetStatusType } from '@/types';


interface FleetStatusProps {
    data: FleetStatusType;
    className?: string;
}

interface FleetStatusSkeletonProps {
    className?: string;
}

interface StatusItemProps {
    label: string;
    value: number;
    total: number;
    bgColor: string;
}


function StatusItem({ label, value, total, bgColor }: StatusItemProps) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', bgColor)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
        </div>
    );
}


export const FleetStatusCard = memo(function FleetStatusCard({
    data,
    className,
}: FleetStatusProps) {
    const { totalCars, availableCars, rentedCars, maintenanceCars, damagedCars, occupancyRate } = data;

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Fleet Status</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Car className="h-4 w-4" aria-hidden="true" />
                        <span>{totalCars} Total</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <StatusItem
                    label="Available"
                    value={availableCars}
                    total={totalCars}
                    bgColor="bg-green-500"
                />
                <StatusItem
                    label="Rented"
                    value={rentedCars}
                    total={totalCars}
                    bgColor="bg-blue-500"
                />
                <StatusItem
                    label="Maintenance"
                    value={maintenanceCars}
                    total={totalCars}
                    bgColor="bg-amber-500"
                />
                <StatusItem
                    label="Damaged"
                    value={damagedCars}
                    total={totalCars}
                    bgColor="bg-red-500"
                />

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-primary" aria-hidden="true" />
                            <span className="text-sm font-medium">Occupancy Rate</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {Math.round(occupancyRate)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});


interface FleetStatusCompactProps {
    data: FleetStatusType;
    className?: string;
}

export const FleetStatusCompact = memo(function FleetStatusCompact({
    data,
    className,
}: FleetStatusCompactProps) {
    const { availableCars, rentedCars, maintenanceCars, damagedCars } = data;

    const items = [
        { label: 'Available', value: availableCars, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Rented', value: rentedCars, icon: Car, color: 'text-blue-500' },
        { label: 'Maintenance', value: maintenanceCars, icon: Settings, color: 'text-amber-500' },
        { label: 'Damaged', value: damagedCars, icon: AlertTriangle, color: 'text-red-500' },
    ];

    return (
        <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}>
            {items.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg bg-muted', color)}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
});


export function FleetStatusSkeleton({ className }: FleetStatusSkeletonProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                        <Skeleton className="h-3 w-8 ml-auto" />
                    </div>
                ))}
                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
