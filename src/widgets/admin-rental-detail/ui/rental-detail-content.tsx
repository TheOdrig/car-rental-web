'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { PageHeader } from '@/shared/ui/page-header';
import { DetailPageLoadingState, DetailPageErrorState, PenaltyWaiveDialog, PenaltyHistorySection, RentalDamageReports } from '@/features/admin';
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
    RejectReasonDialog,
    CONFIRM_COPY,
    hasPenalty,
    shouldShowPenaltyHistory,
    getPickupBlockedReason,
    toCustomerInfo,
    toVehicleInfo,
    toTimelineEvents,
    findTimelineTimestamp,
    type ConfirmableAction,
} from '@/features/process-rentals';
import { fieldErrorMessages } from '@/shared/api';
import { useRentalPayment } from '@/entities/payment';
import { DamageReportForm } from '@/features/manage-damages';
import { canReportDamage, isAdminPaymentExpected, isBeforeRentalEnd, CANCEL_REASON_MAX_LENGTH, useCancelRental } from '@/entities/rental';
import { formatAmount, formatDate, formatRentalReference, personDisplayName } from '@/shared/lib';
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import { ROUTES } from '@/shared/config/routes';
import { useNumericParam } from '@/shared/lib/use-numeric-param';

const SECTION = { label: 'Rentals', href: ROUTES.admin.rentals, backLabel: 'Back to Rentals' };

export function RentalDetailContent({ id }: { id: string }) {
    const rentalId = useNumericParam(id);

    const { data: rental, isLoading, isError, refetch } = useRentalDetail(rentalId);
    const approveRental = useApproveRental();
    const rejectRental = useRejectRental();
    const processPickup = useProcessPickup();
    const processReturn = useProcessReturn();
    const earlyReturn = useProcessEarlyReturn();
    const cancelRental = useCancelRental();
    const singleFlight = useSingleFlight();
    const [confirming, setConfirming] = useState<ConfirmableAction | null>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const earlyReturnPreview = useEarlyReturnPreview(rentalId, confirming === 'earlyReturn' && rental?.status === 'ACTIVE');
    const paymentExpected = isAdminPaymentExpected(rental?.status);
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

    if (isLoading) return <DetailPageLoadingState section={SECTION} />;

    if (isError || !rental) return (
        <DetailPageErrorState
            section={SECTION}
            current={formatRentalReference(rentalId)}
            title="Rental Not Found"
            message="The rental you are looking for does not exist or could not be loaded."
            onRetry={() => refetch()}
        />
    );

    const penaltyPresent = hasPenalty(rental);
    const showPenaltyHistory = shouldShowPenaltyHistory(rental);
    const referenceNumber = formatRentalReference(rentalId);
    const showReportDamage = canReportDamage(
        rental.status,
        findTimelineTimestamp(rental.timeline, 'returned')
    );

    const focusHeading = () => headingRef.current?.focus();

    const confirmReject = () => {
        if (!rejectionReason.trim()) return;
        void singleFlight(async () => {
            const done = await rejectRental.mutateAsync({ rentalId, reason: rejectionReason }).then(() => true, () => false);
            if (!done) return;
            setRejectDialogOpen(false);
            setRejectionReason('');
            await refetch();
            focusHeading();
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
            if (!done) return;
            setConfirming(null);
            setCancelReason('');
            await refetch();
            focusHeading();
        });
    };

    const customerInfo = toCustomerInfo(rental.customer);
    const vehicleInfo = toVehicleInfo(rental.vehicle);
    const pickupBlockedReason = getPickupBlockedReason(rental, {
        isLoading: paymentQuery.isLoading,
        status: paymentQuery.data?.status,
    });
    const timelineEvents = toTimelineEvents(rental.timeline);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Rentals', href: ROUTES.admin.rentals },
                            { label: referenceNumber },
                        ]}
                    />
                }
                title={referenceNumber}
                headingRef={headingRef}
                focusable
                description={
                    <>
                        {rental.vehicle.brand} {rental.vehicle.model} • {personDisplayName(rental.customer)}
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.rentals}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                        <RentalActionButtons
                            status={rental.status}
                            onApprove={() => setConfirming('approve')}
                            onReject={() => setRejectDialogOpen(true)}
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
                        {penaltyPresent && (
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
                    </>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <RentalInfoCard
                    rentalId={rental.id}
                    status={rental.status}
                    createdAt={findTimelineTimestamp(rental.timeline, 'created') ?? rental.startDate}
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
                    penaltyAmount={rental.penaltyAmount}
                    lateReturnStatus={rental.lateReturnStatus}
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

            {penaltyPresent && (
                <>
                    <PenaltyHistorySection
                        rentalId={rentalId}
                        currency={rental.pricing.currency}
                    />
                    <PenaltyWaiveDialog
                        open={waiveDialogOpen}
                        onOpenChange={setWaiveDialogOpen}
                        rentalId={rentalId}
                        originalPenalty={rental.penaltyAmount ?? 0}
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
                        className="space-y-2 rounded-md border border-warning-subtle-foreground/30 bg-warning-subtle p-3 text-sm text-warning-subtle-foreground"
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

            <RejectReasonDialog
                open={rejectDialogOpen}
                onOpenChange={(open) => {
                    setRejectDialogOpen(open);
                    if (!open) setRejectionReason('');
                }}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
                onConfirm={confirmReject}
                isPending={rejectRental.isPending}
            />
        </div>
    );
}