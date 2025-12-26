'use client';

import { CheckCircle, Calendar, MapPin, Clock, Mail, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BookingSuccessProps {
    referenceNumber: string;
    carName?: string;
    startDate?: Date;
    endDate?: Date;
    pickupLocation?: string;
    totalPaid?: number;
    currency?: string;
}

export function BookingSuccess({
    referenceNumber,
    carName = 'Your Selected Vehicle',
    startDate,
    endDate,
    pickupLocation = 'Main Office',
    totalPaid,
    currency = 'USD',
}: BookingSuccessProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6 animate-[bounce_1s_ease-in-out]">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
                        <p className="text-green-100 text-lg">Your car rental has been successfully booked.</p>
                    </div>

                    <div className="px-8 py-8 space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                            <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                                {referenceNumber}
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-foreground mb-4">Booking Details</h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
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
                                            {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                                    <p className="font-medium text-foreground">{pickupLocation}</p>
                                </div>
                            </div>

                            {totalPaid && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Paid</p>
                                        <p className="font-bold text-xl text-green-600 dark:text-green-400">
                                            ${totalPaid.toFixed(2)} {currency}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                What&apos;s Next?
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        A confirmation email has been sent to your registered email address with all booking details.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Arrive at the pickup location with your booking reference and a valid driver&apos;s license.
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
                                <Link href={`/my-rentals/${referenceNumber}`}>
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
                                className="text-muted-foreground"
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
