'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { DetailPageSkeleton, DetailPageError, PenaltyWaiveDialog, PenaltyHistorySection, VehicleDamageHistory, type TimelineEventType } from '@/features/admin';
import {
    RentalInfoCard,
    CustomerInfoCard,
    VehicleInfoCard,
    PaymentInfoCard,
    TimelineCard,
    RentalActionButtons,
    useRentalDetail,
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
    useProcessEarlyReturn,
    useEarlyReturnPreview,
    EarlyReturnPreviewPanel,
    ConfirmActionDialog,
} from '@/features/process-rentals';
import { isPaymentSecured, useRentalPayment } from '@/entities/payment';
import { isAfterRentalEnd, isBeforeRentalStart, PICKUP_AFTER_END_MESSAGE, PICKUP_BEFORE_START_MESSAGE, PICKUP_PAYMENT_REQUIRED_MESSAGE, useCancelRental } from '@/entities/rental';
import { formatRentalReference } from '@/shared/lib';
import { useSingleFlight } from '@/shared/lib/use-single-flight';

const CONFIRM_COPY = {
    pickup: {
        title: 'Hand the vehicle over?',
        description: 'This records the pickup and captures the customer payment that was authorized for this rental.',
        confirm: 'Confirm Pickup',
    },
    return: {
        title: 'Record the return?',
        description: 'This closes the rental and makes the vehicle available again. Late penalties, if any, are calculated from the return time.',
        confirm: 'Confirm Return',
    },
    earlyReturn: {
        title: 'Return the vehicle early?',
        description: 'The rental ends today and the unused days are refunded to the customer according to the rental rules. This cannot be undone.',
        confirm: 'Return Early',
    },
    cancel: {
        title: 'Cancel this rental?',
        description: 'The customer is notified and any authorized payment is released. This cannot be undone.',
        confirm: 'Cancel Rental',
    },
} as const;

export function RentalDetailContent({ id }: { id: string }) {
    const rentalId = parseInt(id, 10);

    const { data: rental, isLoading, isError, refetch } = useRentalDetail(rentalId);
    const approveRental = useApproveRental();
    const rejectRental = useRejectRental();
    const processPickup = useProcessPickup();
    const processReturn = useProcessReturn();
    const earlyReturn = useProcessEarlyReturn();
    const cancelRental = useCancelRental();
    const singleFlight = useSingleFlight();
    const [confirming, setConfirming] = useState<'pickup' | 'return' | 'earlyReturn' | 'cancel' | null>(null);
    const earlyReturnPreview = useEarlyReturnPreview(rentalId, confirming === 'earlyReturn');
    const paymentQuery = useRentalPayment(rentalId, {
        enabled: !isNaN(rentalId) && !!rental && rental.status !== 'PENDING' && rental.status !== 'REJECTED' && rental.status !== 'CANCELLED',
    });

    const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const isActionLoading =
        approveRental.isPending ||
        rejectRental.isPending ||
        processPickup.isPending ||
        processReturn.isPending ||
        earlyReturn.isPending ||
        cancelRental.isPending;

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
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
            <div className="space-y-6 p-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Rentals', href: '/admin/rentals' },
                        { label: formatRentalReference(rentalId) },
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

    const rentalWithPenalty = rental;

    const hasPenalty = (rental.penaltyAmount ?? 0) > 0;
    const showPenaltyHistory = !hasPenalty && ['COMPLETED', 'ACTIVE', 'OVERDUE'].includes(rental.status);
    const referenceNumber = formatRentalReference(rentalId);

    const handleApprove = () => {
        void singleFlight(async () => {
            await approveRental.mutateAsync({ rentalId }).then(() => refetch(), () => undefined);
        });
    };

    const handleReject = () => {
        setRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) return;
        void singleFlight(async () => {
            const done = await rejectRental.mutateAsync({ rentalId, reason: rejectionReason }).then(() => true, () => false);
            if (done) {
                setRejectDialogOpen(false);
                setRejectionReason('');
                void refetch();
            }
        });
    };

    const runConfirmed = () => {
        const action = confirming;
        if (!action) return;
        void singleFlight(async () => {
            const request =
                action === 'pickup'
                    ? processPickup.mutateAsync({ rentalId })
                    : action === 'return'
                      ? processReturn.mutateAsync({ rentalId })
                      : action === 'earlyReturn'
                        ? earlyReturn.mutateAsync({ rentalId })
                        : cancelRental.mutateAsync(rentalId);
            const done = await request.then(() => true, () => false);
            if (done) {
                setConfirming(null);
                void refetch();
            }
        });
    };

    const customerInfo = {
        ...rental.customer,
        name: `${rental.customer.firstName} ${rental.customer.lastName}`,
        isEmailVerified: rental.customer.emailVerified,
        isPhoneVerified: rental.customer.phoneVerified,
        isVerified: rental.customer.emailVerified,
    };

    const vehicleInfo = {
        ...rental.vehicle,
        name: `${rental.vehicle.brand} ${rental.vehicle.model}`,
    };

    const pickupBlockedReason =
        rental.status !== 'CONFIRMED'
            ? undefined
            : isBeforeRentalStart(rental.startDate)
              ? PICKUP_BEFORE_START_MESSAGE
              : isAfterRentalEnd(rental.endDate)
                ? PICKUP_AFTER_END_MESSAGE
                : !paymentQuery.isLoading && !isPaymentSecured(paymentQuery.data?.status)
                  ? PICKUP_PAYMENT_REQUIRED_MESSAGE
                  : undefined;

    const timelineEvents = rental.timeline.map((event, index) => ({
        ...event,
        id: index,
        type: event.type as TimelineEventType,
        title: event.title || 'Status Update',
        description: event.description || '',
    }));

    return (
        <div className="space-y-6 p-6">
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
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/rentals">
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    <RentalActionButtons
                        status={rental.status}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onPickup={() => setConfirming('pickup')}
                        onReturn={() => setConfirming('return')}
                        onEarlyReturn={() => setConfirming('earlyReturn')}
                        onCancel={() => setConfirming('cancel')}
                        pickupBlockedReason={pickupBlockedReason}
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
                    cancellationReason={rental.notes.cancellation}
                />
                <CustomerInfoCard customer={customerInfo} />
                <VehicleInfoCard vehicle={vehicleInfo} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <PaymentInfoCard
                    rentalId={rental.id}
                    pricing={rental.pricing}
                    penaltyAmount={rentalWithPenalty.penaltyAmount}
                    lateReturnStatus={rentalWithPenalty.lateReturnStatus}
                />
                <TimelineCard events={timelineEvents} />
            </div>

            {rental.damages.length > 0 && (
                <VehicleDamageHistory carId={rental.vehicle.id} />
            )}

            {showPenaltyHistory && (
                <PenaltyHistorySection
                    rentalId={rentalId}
                    currency={rental.pricing.currency}
                />
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

            <ConfirmActionDialog
                open={confirming !== null}
                onOpenChange={(open) => !open && setConfirming(null)}
                title={CONFIRM_COPY[confirming ?? 'pickup'].title}
                description={CONFIRM_COPY[confirming ?? 'pickup'].description}
                confirmLabel={CONFIRM_COPY[confirming ?? 'pickup'].confirm}
                destructive={confirming === 'cancel'}
                isPending={isActionLoading}
                confirmDisabled={confirming === 'earlyReturn' && !earlyReturnPreview.data}
                onConfirm={runConfirmed}
            >
                {confirming === 'earlyReturn' && <EarlyReturnPreviewPanel query={earlyReturnPreview} />}
            </ConfirmActionDialog>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Rental</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancelling this rental.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter cancellation reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setRejectionReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={!rejectionReason.trim() || rejectRental.isPending}
                        >
                            {rejectRental.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}