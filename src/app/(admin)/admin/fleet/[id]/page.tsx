'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
    DetailPageSkeleton,
    DetailPageError,
    VehicleDetailInfoCard,
    VehicleImagesCard,
    VehicleStatisticsCard,
    VehicleStatusCard,
    VehicleActiveRentalCard,
    VehicleRentalHistoryTable,
    VehicleDamageHistory,
    ComingSoonPlaceholder,
} from '@/components/admin';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useVehicleDetail, useUpdateCarStatus } from '@/lib/hooks/use-admin';
import type { CarStatus } from '@/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusOptions: { value: CarStatus; label: string }[] = [
    { value: 'Available', label: 'Available' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'Damaged', label: 'Damaged' },
    { value: 'Inspection', label: 'Inspection' },
    { value: 'Sold', label: 'Sold' },
];

export default function VehicleDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const vehicleId = parseInt(id, 10);

    const { data: vehicle, isLoading, isError, refetch } = useVehicleDetail(vehicleId);
    const updateStatus = useUpdateCarStatus();

    if (isNaN(vehicleId)) {
        router.push('/admin/fleet');
        return null;
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
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
            <div className="space-y-6">
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
    const hasActiveRental = vehicle.status === 'Rented' && vehicle.activeRental;

    const handleStatusChange = (newStatus: CarStatus) => {
        updateStatus.mutate(
            { carId: vehicleId, status: newStatus },
            {
                onSuccess: () => {
                    void refetch();
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet', href: '/admin/fleet' },
                    { label: vehicleName },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {vehicleName}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                        <SelectTrigger className="w-[160px]">
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
                {hasActiveRental && vehicle.activeRental && (
                    <VehicleActiveRentalCard activeRental={vehicle.activeRental} />
                )}
            </div>

            {vehicle.statistics && (
                <VehicleStatisticsCard
                    statistics={vehicle.statistics}
                    currency={vehicle.pricing?.currency ?? 'USD'}
                />
            )}

            <VehicleRentalHistoryTable vehicleId={vehicleId} />

            <VehicleDamageHistory carId={vehicleId} maxItems={5} />

            <ComingSoonPlaceholder
                title="Maintenance History"
                description="Maintenance tracking will be available in a future update. Track service records, repairs, and scheduled maintenance."
            />
        </div>
    );
}
