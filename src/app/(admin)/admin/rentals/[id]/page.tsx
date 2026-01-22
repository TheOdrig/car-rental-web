'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
    DetailPageSkeleton,
    DetailPageError,
    RentalInfoCard,
    CustomerInfoCard,
    VehicleInfoCard,
    PaymentInfoCard,
    TimelineCard,
    RentalActionButtons,
    PenaltyWaiveDialog,
    PenaltyHistorySection,
    VehicleDamageHistory,
} from '@/components/admin';
import {
    useRentalDetail,
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
} from '@/lib/hooks/use-admin';
import { showToast } from '@/lib/utils/toast';
import type { LateReturnStatus, RentalDetailResponse } from '@/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function RentalDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const rentalId = parseInt(id, 10);

    const { data: rental, isLoading, isError, refetch } = useRentalDetail(rentalId);
    const approveRental = useApproveRental();
    const rejectRental = useRejectRental();
    const processPickup = useProcessPickup();
    const processReturn = useProcessReturn();

    const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);

    const isActionLoading =
        approveRental.isPending ||
        rejectRental.isPending ||
        processPickup.isPending ||
        processReturn.isPending;

    if (isNaN(rentalId)) {
        router.push('/admin/rentals');
        return null;
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Rentals', href: '/admin/rentals' },
                        { label: 'Loading...' },
                    ]}
                />
                <DetailPageSkeleton />
            </div>
        );
    }

    if (isError || !rental) {
        return (
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Rentals', href: '/admin/rentals' },
                        { label: `Rental #${rentalId}` },
                    ]}
                />
                <DetailPageError
                    title="Rental Not Found"
                    message="The rental you are looking for does not exist or could not be loaded."
                    onRetry={() => refetch()}
                    backUrl="/admin/rentals"
                    backLabel="Back to Rentals"
                />
            </div>
        );
    }

    const rentalWithPenalty = rental as RentalDetailResponse & {
        penaltyAmount?: number;
        lateReturnStatus?: LateReturnStatus;
    };

    const hasPenalty = (rentalWithPenalty.penaltyAmount ?? 0) > 0;
    const referenceNumber = `CR-${String(rentalId).padStart(6, '0')}`;

    const handleApprove = () => {
        approveRental.mutate({ rentalId }, {
            onSuccess: () => {
                void refetch();
            }
        });
    };

    const handleReject = () => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
            rejectRental.mutate({ rentalId, reason }, {
                onSuccess: () => {
                    void refetch();
                }
            });
        }
    };

    const handlePickup = () => {
        processPickup.mutate({ rentalId }, {
            onSuccess: () => {
                void refetch();
            }
        });
    };

    const handleReturn = () => {
        processReturn.mutate({ rentalId }, {
            onSuccess: () => {
                void refetch();
            }
        });
    };

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Rentals', href: '/admin/rentals' },
                    { label: referenceNumber },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {referenceNumber}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rental.vehicle.brand} {rental.vehicle.model} • {rental.customer.firstName} {rental.customer.lastName}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href="/admin/rentals">
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    <RentalActionButtons
                        status={rental.status}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onPickup={handlePickup}
                        onReturn={handleReturn}
                        isLoading={isActionLoading}
                    />
                    {hasPenalty && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => setWaiveDialogOpen(true)}
                        >
                            <DollarSign className="h-4 w-4" />
                            Waive Penalty
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <RentalInfoCard
                    rentalId={rental.id}
                    status={rental.status}
                    createdAt={rental.timeline.find(e => e.type === 'created')?.timestamp ?? rental.startDate}
                    startDate={rental.startDate}
                    endDate={rental.endDate}
                    duration={rental.duration}
                    pricing={rental.pricing}
                    notes={rental.notes.approval}
                />
                <CustomerInfoCard customer={rental.customer} />
                <VehicleInfoCard vehicle={rental.vehicle} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <PaymentInfoCard
                    pricing={rental.pricing}
                    payment={rental.payment}
                    penaltyAmount={rentalWithPenalty.penaltyAmount}
                    lateReturnStatus={rentalWithPenalty.lateReturnStatus}
                />
                <TimelineCard events={rental.timeline} />
            </div>

            {rental.damages.length > 0 && (
                <VehicleDamageHistory carId={rental.vehicle.id} />
            )}

            {hasPenalty && (
                <>
                    <PenaltyHistorySection
                        rentalId={rentalId}
                        currency={rental.pricing.currency}
                    />
                    <PenaltyWaiveDialog
                        open={waiveDialogOpen}
                        onOpenChange={setWaiveDialogOpen}
                        rentalId={rentalId}
                        originalPenalty={rentalWithPenalty.penaltyAmount ?? 0}
                        currency={rental.pricing.currency}
                    />
                </>
            )}
        </div>
    );
}
