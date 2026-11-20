'use client';

import { Activity, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDateTime } from '@/shared/lib';
import type { VehicleCurrentStatus } from '@/entities/car';
import { CarStatusBadge, type CarStatus } from '@/entities/car';

interface VehicleStatusCardProps {
    currentStatus: VehicleCurrentStatus;
}

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
                    <Activity className="h-5 w-5 text-danger-subtle-foreground" />
                    Current Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <CarStatusBadge status={currentStatus.status} className="px-4 py-1 text-base" />
                </div>

                <p className="text-sm text-muted-foreground">
                    {currentStatus.description || statusDescriptions[currentStatus.status as CarStatus]}
                </p>

                <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last changed:</span>
                        <span className="text-foreground">
                            {formatDateTime(currentStatus.lastChangedAt)}
                        </span>
                    </div>

                    {currentStatus.lastChangedBy && (
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Changed by:</span>
                            <span className="text-foreground">{currentStatus.lastChangedBy}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}