'use client';

import { CheckCircle, Calendar, Car, Clock, Mail, FileText, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { DocumentTitle } from '@/shared/ui/document-title';
import { formatDate, formatRentalReference } from '@/shared/lib';
import { useRental } from '@/entities/rental';

function formatBookingReference(ref: string): string {
    const numericId = parseInt(ref, 10);
    if (!isNaN(numericId)) {
        return formatRentalReference(numericId);
    }
    return ref.toUpperCase();
}

interface BookingSuccessProps {
    referenceNumber: string;
    carName?: string;
    startDate?: string;
    endDate?: string;
}

export function BookingSuccess({
    referenceNumber,
    carName = 'Your Selected Vehicle',
    startDate,
    endDate,
}: BookingSuccessProps) {
    const formattedRef = formatBookingReference(referenceNumber);
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                    <div className="bg-success px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6 motion-safe:animate-[bounce_1s_ease-in-out]">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking requested</h1>
                        <p className="text-success-subtle-foreground text-lg">Your rental request has been submitted and is waiting for confirmation.</p>
                    </div>

                    <div className="px-8 py-8 space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                            <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                                {formattedRef}
                            </p>
                        </div>

                        <div className="bg-raised rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-foreground mb-4">Booking Details</h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Car className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle</p>
                                    <p className="font-medium text-foreground">{carName}</p>
                                </div>
                            </div>

                            {startDate && endDate && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rental Period</p>
                                        <p className="font-medium text-foreground">
                                            {formatDate(startDate)} - {formatDate(endDate)}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="bg-info-subtle rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-info-subtle-foreground" />
                                What&apos;s Next?
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-info-subtle-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        An administrator reviews your request. Once it is confirmed, pay for it from your rental page. Payments run in Stripe test mode: this is a demo.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-info-subtle-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Your card is held when you pay and charged at pickup. Bring your booking reference and a valid driver&apos;s license.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-info-subtle-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Complete a quick vehicle inspection before departure.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild className="flex-1">
                                <Link href={`/rentals/${referenceNumber}`}>
                                    View Booking Details
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="flex-1">
                                <Link href="/">
                                    Return to Home
                                </Link>
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export function BookingSuccessLoader({ referenceNumber }: { referenceNumber: string }) {
    const rentalId = Number(referenceNumber);
    const { data: rental, isLoading, isError } = useRental(Number.isInteger(rentalId) ? rentalId : null);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 px-4 py-12" aria-busy="true">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        );
    }

    if (isError || !rental) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
                <div className="max-w-md text-center" role="alert">
                    <DocumentTitle title="Booking not found" />
                    <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" aria-hidden="true" />
                    <h1 className="mb-2 text-2xl font-bold">We could not load this booking</h1>
                    <p className="mb-6 text-muted-foreground">
                        This booking does not exist or belongs to another account. Your requests are listed on your rentals page.
                    </p>
                    <Button asChild>
                        <Link href="/rentals">My Rentals</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const carName = rental.carSummary
        ? `${rental.carSummary.brand} ${rental.carSummary.model}`
        : undefined;

    return (
        <BookingSuccess
            referenceNumber={referenceNumber}
            carName={carName}
            startDate={rental.startDate}
            endDate={rental.endDate}
        />
    );
}
