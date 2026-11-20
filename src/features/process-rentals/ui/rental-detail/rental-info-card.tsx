'use client';

import { FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CopyButton } from '@/shared/ui/copy-button';
import { formatCurrency, formatDateTime, formatDate, formatRentalReference } from '@/shared/lib';
import {
    AdminRentalStatusBadge,
    RentalCancellationNotice,
    type AdminRentalStatus,
    type RentalPricing,
} from '@/entities/rental';

interface RentalInfoCardProps {
    rentalId: number;
    status: AdminRentalStatus;
    createdAt: string;
    startDate: string;
    endDate: string;
    duration: number;
    pricing?: RentalPricing;
    pickupLocation?: string;
    dropoffLocation?: string;
    notes?: string;
    bookingNotes?: string;
    cancellationReason?: string;
    cancelledBy?: string;
}

export function RentalInfoCard({
    rentalId,
    status,
    createdAt,
    startDate,
    endDate,
    duration,
    pricing,
    pickupLocation,
    dropoffLocation,
    notes,
    bookingNotes,
    cancellationReason,
    cancelledBy,
}: RentalInfoCardProps) {
    const referenceNumber = formatRentalReference(rentalId);

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Rental Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reference</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono font-medium text-foreground">
                            {referenceNumber}
                        </span>
                        <CopyButton value={referenceNumber} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <AdminRentalStatusBadge status={status} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-1 text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{duration} days</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm text-foreground">
                        {formatDateTime(createdAt)}
                    </span>
                </div>

                <div className="border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Start Date</span>
                            <span className="text-sm font-medium text-foreground">
                                {formatDate(startDate)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">End Date</span>
                            <span className="text-sm font-medium text-foreground">
                                {formatDate(endDate)}
                            </span>
                        </div>
                    </div>
                </div>

                {pricing && (
                    <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Daily Rate</span>
                            <span className="text-sm text-foreground">
                                {formatCurrency(pricing.dailyRate, pricing.currency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Subtotal</span>
                            <span className="text-sm text-foreground">
                                {formatCurrency(pricing.subtotal, pricing.currency)}
                            </span>
                        </div>
                        {pricing.discounts > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-success-subtle-foreground">Discount</span>
                                <span className="text-sm text-success-subtle-foreground">
                                    -{formatCurrency(pricing.discounts, pricing.currency)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-sm font-medium text-muted-foreground">Total</span>
                            <span className="text-sm font-bold text-foreground">
                                {formatCurrency(pricing.finalTotal, pricing.currency)}
                            </span>
                        </div>
                        {pricing.exchangeRate && pricing.exchangeRate !== 1 && (
                            <div className="text-xs text-muted-foreground text-right">
                                Exchange rate: {pricing.exchangeRate.toFixed(4)}
                            </div>
                        )}
                    </div>
                )}

                {(pickupLocation || dropoffLocation) && (
                    <div className="border-t border-border pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            {pickupLocation && (
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Pickup</span>
                                    <span className="text-sm text-foreground">{pickupLocation}</span>
                                </div>
                            )}
                            {dropoffLocation && (
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Drop-off</span>
                                    <span className="text-sm text-foreground">{dropoffLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(cancelledBy || cancellationReason) && (
                    <div className="border-t border-border pt-4">
                        <RentalCancellationNotice audience="admin" cancelledBy={cancelledBy} reason={cancellationReason} />
                    </div>
                )}

                {bookingNotes && (
                    <div className="border-t border-border pt-4" data-testid="booking-notes">
                        <span className="text-xs text-muted-foreground block mb-1">Customer Notes</span>
                        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{bookingNotes}</p>
                    </div>
                )}

                {notes && (
                    <div className="border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                        <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}