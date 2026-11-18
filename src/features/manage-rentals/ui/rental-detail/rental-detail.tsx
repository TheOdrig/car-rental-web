'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn, safeFormatDateTime } from '@/shared/lib';
import { useCancelRental } from '@/entities/rental';
import { RentalPaymentStatus, isPayableStatus } from '@/entities/payment';
import type { Rental } from '@/entities/rental';
import { RentalTimeline } from '../rental-timeline';
import { CancelRentalDialog } from './cancel-rental-dialog';
import { DriverDetailsCard } from './driver-details-card';
import { getStatusColor } from './format';
import { InsuranceCard } from './insurance-card';
import { PaymentSummaryCard } from './payment-summary-card';
import { PickupLocationCard } from './pickup-location-card';
import { RentalNotesCard, hasRentalNotes } from './rental-notes-card';
import { RentalPeriodCard } from './rental-period-card';
import { VehicleDetailsCard } from './vehicle-details-card';

interface RentalDetailProps {
    rental: Rental;
    className?: string;
    onCancelSuccess?: () => void;
}

export function RentalDetail({ rental, className, onCancelSuccess }: RentalDetailProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const cancelMutation = useCancelRental();

    const { carSummary, startDate, endDate, days = 1, dailyPrice = 0, totalPrice, currency = 'USD', status } = rental;
    const canCancel = status === 'Requested';

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
                        <h1 className="text-2xl font-bold">Order #{rental.id}</h1>
                        <Badge className={cn('border', getStatusColor(status))}>{status}</Badge>
                    </div>
                    <p className="text-muted-foreground">Booked on {safeFormatDateTime(rental.createTime)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
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
                    <DriverDetailsCard userSummary={rental.userSummary} />
                    {hasRentalNotes(rental) && <RentalNotesCard rental={rental} />}
                    <RentalPeriodCard startDate={startDate} endDate={endDate} days={days} />
                    <InsuranceCard />
                    <PickupLocationCard />
                </div>

                <div className="space-y-6">
                    {status !== 'Requested' && (
                        <RentalPaymentStatus
                            rentalId={rental.id}
                            action={(paymentStatus) =>
                                status === 'Confirmed' && isPayableStatus(paymentStatus) ? (
                                    <Button asChild className="w-full">
                                        <Link href={`/rentals/${rental.id}/pay`}>{paymentStatus === 'CANCELLED' ? 'Pay again' : 'Pay now'}</Link>
                                    </Button>
                                ) : null
                            }
                        />
                    )}
                    <PaymentSummaryCard
                        dailyPrice={dailyPrice}
                        days={days}
                        totalPrice={totalPrice}
                        totalSavings={rental.totalSavings}
                        currency={currency}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RentalTimeline status={status} startDate={startDate} endDate={endDate} />
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
