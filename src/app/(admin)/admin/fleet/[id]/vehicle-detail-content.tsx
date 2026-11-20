'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { DetailPageSkeleton, DetailPageError, VehicleDamageHistory } from '@/features/admin';
import {
    VehicleDetailInfoCard,
    VehicleImagesCard,
    VehicleStatisticsCard,
    VehicleStatusCard,
    VehicleRentalHistoryTable,
    useVehicleDetail,
    useChangeCarStatus,
} from '@/features/manage-fleet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { CAR_STATUSES, CAR_SERVICE_STATUS_LABELS, type CarStatus } from '@/entities/car';

const statusOptions = CAR_STATUSES.map((value) => ({ value, label: CAR_SERVICE_STATUS_LABELS[value] }));

export function VehicleDetailContent({ id }: { id: string }) {
    const vehicleId = parseInt(id, 10);

    const { data: vehicle, isLoading, isError, refetch } = useVehicleDetail(vehicleId);
    const updateStatus = useChangeCarStatus();

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Fleet', href: '/admin/fleet' },
                        { label: 'Loading...' },
                    ]}
                />
                <DetailPageSkeleton />
            </div>
        );
    }

    if (isError || !vehicle) {
        return (
            <div className="space-y-6 p-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Fleet', href: '/admin/fleet' },
                        { label: `Vehicle #${vehicleId}` },
                    ]}
                />
                <DetailPageError
                    title="Vehicle Not Found"
                    message="The vehicle you are looking for does not exist or could not be loaded."
                    onRetry={() => refetch()}
                    backUrl="/admin/fleet"
                    backLabel="Back to Fleet"
                />
            </div>
        );
    }

    const vehicleName = `${vehicle.brand} ${vehicle.model}`;

    const handleStatusChange = (newStatus: CarStatus) => {
        updateStatus.mutate(
            { id: vehicleId, status: newStatus },
            {
                onSuccess: () => {
                    void refetch();
                },
            }
        );
    };

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet', href: '/admin/fleet' },
                    { label: vehicleName },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {vehicleName}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {vehicle.year} • {vehicle.licensePlate} • {vehicle.color}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/fleet">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Fleet
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/fleet/${vehicleId}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit Vehicle
                        </Link>
                    </Button>
                    <Select
                        value={vehicle.status}
                        onValueChange={(value) => handleStatusChange(value as CarStatus)}
                        disabled={updateStatus.isPending}
                    >
                        <SelectTrigger aria-label="Change vehicle status" className="w-[160px]">
                            <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/damages?carId=${vehicleId}`}>
                            <AlertTriangle className="h-4 w-4" />
                            View Damages
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <VehicleImagesCard images={vehicle.images ?? { primary: '', additional: [] }} vehicleName={vehicleName} />
                <VehicleDetailInfoCard vehicle={vehicle} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {vehicle.currentStatus && <VehicleStatusCard currentStatus={vehicle.currentStatus} />}
            </div>

            {vehicle.statistics && (
                <VehicleStatisticsCard
                    statistics={vehicle.statistics}
                    currency={vehicle.pricing?.currency ?? 'USD'}
                />
            )}

            <VehicleRentalHistoryTable vehicleId={vehicleId} />

            <VehicleDamageHistory carId={vehicleId} maxItems={5} />
        </div>
    );
}