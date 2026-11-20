'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { DetailPageSkeleton, DetailPageError, PenaltyWaiveDialog, PenaltyHistorySection, RentalDamageReports, type TimelineEventType } from '@/features/admin';
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
    CancelReasonField,
} from '@/features/process-rentals';
import { fieldErrorMessages } from '@/shared/api';
import { isPaymentSecured, useRentalPayment } from '@/entities/payment';
import { DamageReportForm } from '@/entities/damage';
import { canReportDamage, isAfterRentalEnd, isBeforeRentalEnd, isBeforeRentalStart, PICKUP_AFTER_END_MESSAGE, PICKUP_BEFORE_START_MESSAGE, PICKUP_PAYMENT_REQUIRED_MESSAGE, CANCEL_REASON_MAX_LENGTH, useCancelRental } from '@/entities/rental';
import { formatAmount, formatDate, formatRentalReference, personDisplayName } from '@/shared/lib';
import { useSingleFlight } from '@/shared/lib/use-single-flight';

const CONFIRM_COPY = {
    approve: {
        title: 'Approve this rental request?',
        description: 'The customer is notified and can pay once the payment window opens. This cannot be undone.',
        confirm: 'Confirm Approval',
    },
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
    const [confirming, setConfirming] = useState<'approve' | 'pickup' | 'return' | 'earlyReturn' | 'cancel' | null>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const earlyReturnPreview = useEarlyReturnPreview(rentalId, confirming === 'earlyReturn' && rental?.status === 'ACTIVE');
    const paymentExpected = !!rental && rental.status !== 'PENDING' && rental.status !== 'CANCELLED' && rental.status !== 'UNKNOWN';
    const paymentQuery = useRentalPayment(rentalId, { enabled: !isNaN(rentalId) && paymentExpected });

    const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
    const [damageDialogOpen, setDamageDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [cancelReason, setCancelReason] = useState('');

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
    const showPenaltyHistory = !hasPenalty && ['COMPLETED', 'ACTIVE'].includes(rental.status);
    const referenceNumber = formatRentalReference(rentalId);
    const showReportDamage = canReportDamage(
        rental.status,
        rental.timeline.find((event) => event.type === 'returned')?.timestamp
    );

    const focusHeading = () => headingRef.current?.focus();

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
                await refetch();
                focusHeading();
            }
        });
    };

    const runConfirmed = () => {
        const action = confirming;
        if (!action) return;
        void singleFlight(async () => {
            const request =
                action === 'approve'
                    ? approveRental.mutateAsync({ rentalId })
                    : action === 'pickup'
                      ? processPickup.mutateAsync({ rentalId })
                      : action === 'return'
                      ? processReturn.mutateAsync({ rentalId })
                      : action === 'earlyReturn'
                        ? earlyReturn.mutateAsync({ rentalId })
                        : cancelRental.mutateAsync({ rentalId, reason: cancelReason });
            const done = await request.then(() => true, () => false);
            if (done) {
                setConfirming(null);
                setCancelReason('');
                await refetch();
                focusHeading();
            }
        });
    };

    const customerInfo = {
        ...rental.customer,
        name: personDisplayName(rental.customer),
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white focus:outline-none">
                            {referenceNumber}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rental.vehicle.brand} {rental.vehicle.model} • {personDisplayName(rental.customer)}
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
                        onApprove={() => setConfirming('approve')}
                        onReject={handleReject}
                        onPickup={() => setConfirming('pickup')}
                        onReturn={() => setConfirming('return')}
                        onEarlyReturn={() => setConfirming('earlyReturn')}
                        onCancel={() => setConfirming('cancel')}
                        pickupBlockedReason={pickupBlockedReason}
                        isLoading={isActionLoading}
                    />
                    {showReportDamage && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setDamageDialogOpen(true)}>
                            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                            Report Damage
                        </Button>
                    )}
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
                    bookingNotes={rental.notes.booking}
                    cancellationReason={rental.notes.cancellation}
                    cancelledBy={rental.cancelledBy}
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
                    paymentEnabled={paymentExpected}
                    paymentDueBy={rental.paymentDueBy}
                />
                <TimelineCard events={timelineEvents} />
            </div>

            {rental.damages.length > 0 && (
                <RentalDamageReports damages={rental.damages} />
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

            {showReportDamage && (
                <DamageReportForm
                    rentalId={rentalId}
                    open={damageDialogOpen}
                    onOpenChange={setDamageDialogOpen}
                    onSuccess={() => void refetch()}
                />
            )}

            <ConfirmActionDialog
                open={confirming !== null}
                onOpenChange={(open) => {
                    if (open) return;
                    setConfirming(null);
                    setCancelReason('');
                    cancelRental.reset();
                }}
                title={CONFIRM_COPY[confirming ?? 'approve'].title}
                description={CONFIRM_COPY[confirming ?? 'approve'].description}
                confirmLabel={CONFIRM_COPY[confirming ?? 'approve'].confirm}
                destructive={confirming === 'cancel'}
                isPending={isActionLoading}
                confirmDisabled={
                    (confirming === 'earlyReturn' && !earlyReturnPreview.data) ||
                    (confirming === 'cancel' && cancelReason.length > CANCEL_REASON_MAX_LENGTH)
                }
                onConfirm={runConfirmed}
            >
                {confirming === 'approve' && (
                    <dl data-testid="approve-summary" className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md border bg-muted/40 p-3 text-sm">
                        <dt className="text-muted-foreground">Customer</dt>
                        <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{personDisplayName(rental.customer)}</dd>
                        <dt className="text-muted-foreground">Vehicle</dt>
                        <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{rental.vehicle.brand} {rental.vehicle.model}</dd>
                        <dt className="text-muted-foreground">Dates</dt>
                        <dd className="font-medium">{formatDate(rental.startDate)} to {formatDate(rental.endDate)}</dd>
                        <dt className="text-muted-foreground">Total</dt>
                        <dd className="font-semibold">{formatAmount(rental.pricing.finalTotal, rental.pricing.currency)}</dd>
                    </dl>
                )}
                {confirming === 'earlyReturn' && <EarlyReturnPreviewPanel query={earlyReturnPreview} />}
                {confirming === 'return' && isBeforeRentalEnd(rental.endDate) && (
                    <div
                        role="note"
                        data-testid="early-return-warning"
                        className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
                    >
                        <p>
                            This rental runs until {formatDate(rental.endDate)}. A normal return keeps the full price. To refund the unused days, use Return Early instead.
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={() => setConfirming('earlyReturn')}>
                            Use Return Early
                        </Button>
                    </div>
                )}
                {confirming === 'cancel' && (
                    <CancelReasonField
                        value={cancelReason}
                        onChange={setCancelReason}
                        maxLength={CANCEL_REASON_MAX_LENGTH}
                        error={fieldErrorMessages(cancelRental.error, 'reason')[0]}
                        disabled={isActionLoading}
                    />
                )}
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