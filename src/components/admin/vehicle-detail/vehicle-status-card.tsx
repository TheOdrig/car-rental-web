'use client';

import { Activity, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeFormatDate } from '@/lib/utils/format';
import type { VehicleCurrentStatus, CarStatus } from '@/types';

interface VehicleStatusCardProps {
    currentStatus: VehicleCurrentStatus;
}

const statusColors: Record<CarStatus, string> = {
    Available: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
    Rented: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    Maintenance: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    Reserved: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
    Sold: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700',
    Damaged: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    Inspection: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
};

const statusDescriptions: Record<CarStatus, string> = {
    Available: 'Vehicle is available for rental',
    Rented: 'Vehicle is currently rented out',
    Maintenance: 'Vehicle is undergoing maintenance',
    Reserved: 'Vehicle is reserved for an upcoming rental',
    Sold: 'Vehicle has been sold and is no longer in fleet',
    Damaged: 'Vehicle has damage that needs repair',
    Inspection: 'Vehicle is undergoing inspection',
};

export function VehicleStatusCard({ currentStatus }: VehicleStatusCardProps) {
    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-rose-500" />
                    Current Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[currentStatus.status]} text-base px-4 py-1`} variant="outline">
                        {currentStatus.status}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentStatus.description || statusDescriptions[currentStatus.status]}
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">Last changed:</span>
                        <span className="text-slate-900 dark:text-slate-100">
                            {safeFormatDate(currentStatus.lastChangedAt, 'datetime')}
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

