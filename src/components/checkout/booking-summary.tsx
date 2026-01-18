'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Lock, ArrowRight, Phone, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import type { Car, PriceBreakdown } from '@/types';

interface BookingSummaryProps {
    car: Car;
    startDate: Date;
    endDate: Date;
    pickupLocation: string;
    dropoffLocation: string;
    priceBreakdown: PriceBreakdown;
    isSubmitting: boolean;
    isFormValid: boolean;
}

export function BookingSummary({
    car,
    startDate,
    endDate,
    pickupLocation,
    dropoffLocation,
    priceBreakdown,
    isSubmitting,
    isFormValid,
}: BookingSummaryProps) {
    return (
        <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 pb-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {car.brand} {car.model}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-medium">
                            {car.transmissionType}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-medium">
                            {car.fuelType}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-center bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-950">
                    <div className="relative w-full max-w-[280px] aspect-[16/9] group">
                        <Image
                            src={car.imageUrl || '/placeholder-car.png'}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            className="object-contain drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border space-y-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                            <div className="w-0.5 h-full bg-border my-1" />
                        </div>
                        <div className="pb-4">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Pick-up
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{pickupLocation}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {format(startDate, 'MMM d, yyyy')} • {format(startDate, 'h:mm a')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Drop-off
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{dropoffLocation}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {format(endDate, 'MMM d, yyyy')} • {format(endDate, 'h:mm a')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 px-6 py-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>
                                Car Rental ({priceBreakdown.rentalDays}{' '}
                                {priceBreakdown.rentalDays === 1 ? 'day' : 'days'})
                            </span>
                            <span className="font-medium tabular-nums">
                                {formatCurrency(priceBreakdown.rentalCost, priceBreakdown.currency)}
                            </span>
                        </div>

                        <div className="flex justify-between text-muted-foreground">
                            <span>Taxes & Fees</span>
                            <span className="font-medium tabular-nums">
                                {formatCurrency(priceBreakdown.taxesAndFees, priceBreakdown.currency)}
                            </span>
                        </div>

                        {priceBreakdown.addonsDetail.map((addon, index) => (
                            <div key={index} className="flex justify-between text-primary">
                                <span>{addon.name}</span>
                                <span className="font-medium tabular-nums">
                                    +{formatCurrency(addon.cost, priceBreakdown.currency)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-border my-4" />

                    <div className="flex justify-between items-end mb-6">
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">Total Price</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
                                {formatCurrency(priceBreakdown.total, priceBreakdown.currency)}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {priceBreakdown.currency}, includes all taxes
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base font-bold shadow-md group"
                        disabled={isSubmitting || !isFormValid}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Confirm & Pay
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <div className="mt-4 flex justify-center items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Lock className="h-4 w-4" />
                        SSL Secure Transaction
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full p-2 shrink-0">
                    <Headphones className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Need Help?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Call our 24/7 support line if you have any questions.
                    </p>
                    <a
                        href="tel:+18001234567"
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2 inline-flex items-center gap-1 hover:underline"
                    >
                        <Phone className="h-4 w-4" />
                        +1 (800) 123-4567
                    </a>
                </div>
            </div>
        </div>
    );
}
