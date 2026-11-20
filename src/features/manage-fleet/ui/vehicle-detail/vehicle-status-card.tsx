'use client';

import { Activity, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { formatDateTime } from '@/shared/lib';
import type { VehicleCurrentStatus } from '@/entities/car';
import { carStatusLabel, type CarStatus } from '@/entities/car';

interface VehicleStatusCardProps {
    currentStatus: VehicleCurrentStatus;
}

const statusColors: Record<CarStatus, string> = {
    AVAILABLE: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
    MAINTENANCE: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    DAMAGED: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    INSPECTION: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
};

const statusDescriptions: Record<CarStatus, string> = {
    AVAILABLE: 'Vehicle is available for rental',
    MAINTENANCE: 'Vehicle is undergoing maintenance',
    DAMAGED: 'Vehicle has damage that needs repair',
    INSPECTION: 'Vehicle is undergoing inspection',
};

export function VehicleStatusCard({ currentStatus }: VehicleStatusCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-rose-500" />
                    Current Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[currentStatus.status as CarStatus]} text-base px-4 py-1`} variant="outline">
                        {carStatusLabel(currentStatus.status)}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentStatus.description || statusDescriptions[currentStatus.status as CarStatus]}
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">Last changed:</span>
                        <span className="text-slate-900 dark:text-slate-100">
                            {formatDateTime(currentStatus.lastChangedAt)}
                        </span>
                    </div>

                    {currentStatus.lastChangedBy && (
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-500 dark:text-slate-400">Changed by:</span>
                            <span className="text-slate-900 dark:text-slate-100">{currentStatus.lastChangedBy}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}