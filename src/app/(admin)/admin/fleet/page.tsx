'use client';

import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FleetStatusCard, FleetStatusCompact } from '@/components/admin';
import { useFleetStatus, useInvalidateAdmin } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';


export default function AdminFleetPage() {
    const { data: fleetStatus, isLoading } = useFleetStatus();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.fleet();
        toast.success('Fleet status refreshed');
    };

    const lastUpdated = fleetStatus?.generatedAt
        ? new Date(fleetStatus.generatedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    const defaultFleetStatus = {
        totalCars: 0,
        availableCars: 0,
        rentedCars: 0,
        maintenanceCars: 0,
        damagedCars: 0,
        occupancyRate: 0,
        generatedAt: new Date().toISOString(),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fleet Status</h1>
                    <p className="text-muted-foreground">
                        Overview of your vehicle fleet
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Updated {lastUpdated}</span>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <FleetStatusCompact
                data={fleetStatus ?? defaultFleetStatus}
                className={isLoading ? 'opacity-50' : ''}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <FleetStatusCard
                    data={fleetStatus ?? defaultFleetStatus}
                    className={isLoading ? 'opacity-50' : ''}
                />

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Fleet Statistics</h2>
                    <div className="rounded-lg border bg-card p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Total Vehicles</span>
                            <span className="text-2xl font-bold">
                                {fleetStatus?.totalCars ?? 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Utilization Rate</span>
                            <span className="text-2xl font-bold text-primary">
                                {Math.round(fleetStatus?.occupancyRate ?? 0)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Available Now</span>
                            <span className="text-2xl font-bold text-green-600">
                                {fleetStatus?.availableCars ?? 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Needs Attention</span>
                            <span className="text-2xl font-bold text-amber-600">
                                {(fleetStatus?.maintenanceCars ?? 0) + (fleetStatus?.damagedCars ?? 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
