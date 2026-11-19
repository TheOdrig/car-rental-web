'use client';

import { CheckCircle, Calendar, Clock, Mail, FileText, Printer, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
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
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6 motion-safe:animate-[bounce_1s_ease-in-out]">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Requested!</h1>
                        <p className="text-green-100 text-lg">Your rental request has been submitted and is waiting for confirmation.</p>
                    </div>

                    <div className="px-8 py-8 space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Booking Reference</p>
                            <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                                {formattedRef}
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Booking Details</h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Vehicle</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{carName}</p>
                                </div>
                            </div>

                            {startDate && endDate && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Rental Period</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                            {formatDate(startDate)} - {formatDate(endDate)}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                What&apos;s Next?
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        An administrator reviews your request. Once it is confirmed, pay for it from your rental page. Payments run in Stripe test mode: this is a demo.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Your card is held when you pay and charged at pickup. Bring your booking reference and a valid driver&apos;s license.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
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

                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrint}
                                className="text-slate-600 dark:text-slate-400"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
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
    const { data: rental } = useRental(Number.isInteger(rentalId) ? rentalId : null);
    const carName = rental?.carSummary
        ? `${rental.carSummary.brand} ${rental.carSummary.model}`
        : undefined;

    return (
        <BookingSuccess
            referenceNumber={referenceNumber}
            carName={carName}
            startDate={rental?.startDate}
            endDate={rental?.endDate}
        />
    );
}
