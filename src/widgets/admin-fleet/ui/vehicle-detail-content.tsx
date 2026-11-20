'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { PageHeader } from '@/shared/ui/page-header';
import { DetailPageLoadingState, DetailPageErrorState, VehicleDamageHistory } from '@/features/admin';
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
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { useNumericParam } from '@/shared/lib/use-numeric-param';

const statusOptions = CAR_STATUSES.map((value) => ({ value, label: CAR_SERVICE_STATUS_LABELS[value] }));

const SECTION = { label: 'Fleet', href: ROUTES.admin.fleet, backLabel: 'Back to Fleet' };

export function VehicleDetailContent({ id }: { id: string }) {
    const vehicleId = useNumericParam(id);

    const { data: vehicle, isLoading, isError, refetch } = useVehicleDetail(vehicleId);
    const updateStatus = useChangeCarStatus();

    if (isLoading) return <DetailPageLoadingState section={SECTION} />;

    if (isError || !vehicle) return (
        <DetailPageErrorState
            section={SECTION}
            current={`Vehicle #${vehicleId}`}
            title="Vehicle Not Found"
            message="The vehicle you are looking for does not exist or could not be loaded."
            onRetry={() => refetch()}
        />
    );

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
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Fleet', href: ROUTES.admin.fleet },
                            { label: vehicleName },
                        ]}
                    />
                }
                title={vehicleName}
                description={
                    <>
                        {vehicle.year} • {vehicle.licensePlate} • {vehicle.color}
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.fleet}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Fleet
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.fleetEdit(vehicleId)}>
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
                            <Link href={ROUTES.admin.damagesOfCar(vehicleId)}>
                                <AlertTriangle className="h-4 w-4" />
                                View Damages
                            </Link>
                        </Button>
                    </>
                }
            />

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
                    currency={vehicle.pricing?.currency ?? DEFAULT_CURRENCY}
                />
            )}

            <VehicleRentalHistoryTable vehicleId={vehicleId} />

            <VehicleDamageHistory carId={vehicleId} maxItems={5} />
        </div>
    );
}