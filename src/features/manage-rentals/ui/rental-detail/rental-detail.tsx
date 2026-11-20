'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn, formatDate, formatDateTime, formatRentalReference } from '@/shared/lib';
import {
    getPaymentOpensOn,
    isPaymentWindowOpen,
    isRentalPaymentSecured,
    RentalStatusBadge,
    RentalCancellationNotice,
    RentalPaymentNote,
    RentalStatus,
    toPriceAdjustments,
    useCancelRental,
} from '@/entities/rental';
import { RentalPaymentStatus, isPayableStatus } from '@/entities/payment';
import type { Rental } from '@/entities/rental';
import { RentalTimeline } from '../rental-timeline';
import { CancelRentalDialog } from './cancel-rental-dialog';
import { DriverDetailsCard } from './driver-details-card';
import { PaymentSummaryCard } from './payment-summary-card';
import { RentalDamageReports } from './rental-damage-reports';
import { RentalNotesCard, hasRentalNotes } from './rental-notes-card';
import { RentalPeriodCard } from './rental-period-card';
import { VehicleDetailsCard } from './vehicle-details-card';

interface RentalDetailProps {
    rental: Rental;
    driverName?: string;
    className?: string;
    onCancelSuccess?: () => void;
}

export function RentalDetail({ rental, driverName, className, onCancelSuccess }: RentalDetailProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const cancelMutation = useCancelRental();

    const { carSummary, startDate, endDate, days = 1, dailyPrice = 0, totalPrice, currency = 'USD', status, paymentOpensOn } = rental;
    const canCancel = status === RentalStatus.REQUESTED;

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(rental.id);
            setShowCancelDialog(false);
            onCancelSuccess?.();
        } catch {
            return;
        }
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Rental {formatRentalReference(rental.id)}</h1>
                        <RentalStatusBadge status={status} />
                    </div>
                    <p className="text-muted-foreground">Booked on {formatDateTime(rental.createTime)}</p>
                    {status === RentalStatus.CANCELLED && (
                        <RentalCancellationNotice
                            className="mt-2"
                            cancelledBy={rental.cancelledBy}
                            reason={rental.cancellationReason}
                        />
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="bg-danger-subtle border-danger-subtle-foreground/30 text-danger-subtle-foreground hover:bg-danger-subtle hover:text-danger-subtle-foreground"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <X className="mr-2 h-4 w-4" aria-hidden="true" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <VehicleDetailsCard carSummary={carSummary} />
                    <DriverDetailsCard userSummary={rental.userSummary} fullName={driverName} />
                    {hasRentalNotes(rental) && <RentalNotesCard rental={rental} />}
                    <RentalPeriodCard startDate={startDate} endDate={endDate} days={days} returnedAt={rental.returnedAt} />
                    {(status === RentalStatus.IN_USE || status === RentalStatus.RETURNED) && (
                        <RentalDamageReports rentalId={rental.id} />
                    )}
                </div>

                <div className="space-y-6">
                    {status !== RentalStatus.REQUESTED && (
                        <RentalPaymentStatus
                            rentalId={rental.id}
                            note={
                                <RentalPaymentNote
                                    status={status}
                                    paymentStatus={rental.paymentStatus}
                                    paymentDueBy={rental.paymentDueBy}
                                    showState={false}
                                />
                            }
                            action={(paymentStatus) => {
                                if (
                                    status !== RentalStatus.CONFIRMED ||
                                    isRentalPaymentSecured(rental.paymentStatus) ||
                                    !isPayableStatus(paymentStatus)
                                ) {
                                    return null;
                                }
                                if (!isPaymentWindowOpen(paymentOpensOn)) {
                                    const opensOn = getPaymentOpensOn(paymentOpensOn);
                                    return (
                                        <div className="space-y-2">
                                            <Button className="w-full" disabled>
                                                Pay now
                                            </Button>
                                            {opensOn && (
                                                <p className="text-center text-sm text-muted-foreground">
                                                    Payment opens on {formatDate(opensOn)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <Button asChild className="w-full">
                                        <Link href={`/rentals/${rental.id}/pay`}>{paymentStatus === 'CANCELLED' ? 'Pay again' : 'Pay now'}</Link>
                                    </Button>
                                );
                            }}
                        />
                    )}
                    <PaymentSummaryCard
                        dailyPrice={dailyPrice}
                        days={days}
                        originalPrice={rental.originalPrice}
                        totalPrice={totalPrice}
                        totalSavings={rental.totalSavings}
                        adjustments={toPriceAdjustments(rental.priceAdjustments)}
                        currency={currency}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RentalTimeline
                                status={status}
                                startDate={startDate}
                                endDate={endDate}
                                confirmedAt={rental.confirmedAt}
                                pickedUpAt={rental.pickedUpAt}
                                returnedAt={rental.returnedAt}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CancelRentalDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                onConfirm={handleCancel}
                isPending={cancelMutation.isPending}
            />
        </div>
    );
}
