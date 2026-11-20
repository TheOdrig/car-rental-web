'use client';

import { DynamicImage } from '@/shared/ui/dynamic-image';
import { Lock, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { formatDate } from '@/shared/lib';
import { useCurrency } from '@/entities/currency';
import { describeRateBasis, mapCurrency } from '@/entities/currency';
import type { PriceBreakdown } from '../../model/types';
import type { Car } from '@/entities/car';

interface BookingSummaryProps {
    car: Car;
    startDate: Date;
    endDate: Date;
    priceBreakdown: PriceBreakdown;
    isPricingLoading?: boolean;
    isPricingFailed?: boolean;
    isSubmitting: boolean;
    submitError?: string | null;
    unavailableMessage?: string | null;
}

export function BookingSummary({
    car,
    startDate,
    endDate,
    priceBreakdown,
    isPricingLoading = false,
    isPricingFailed = false,
    isSubmitting,
    submitError = null,
    unavailableMessage = null,
}: BookingSummaryProps) {
    const { format: formatPrice, formatSource, isConverted, rateSource } = useCurrency();
    const sourceCurrency = mapCurrency(priceBreakdown.currency);

    return (
        <div className="sticky top-24 space-y-6">
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-6 pb-0">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                        {car.brand} {car.model}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                            {car.transmissionType}
                        </span>
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                            {car.fuelType}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-center bg-muted/40">
                    <div className="relative w-full max-w-[280px] aspect-[16/9] group">
                        <DynamicImage
                            src={car.imageUrl || '/images/car-placeholder.svg'}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            sizes="280px"
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
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Start Date
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {formatDate(startDate)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-card" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                                End Date
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {formatDate(endDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-raised px-6 py-6 border-t border-border">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>
                                Car Rental ({priceBreakdown.rentalDays}{' '}
                                {priceBreakdown.rentalDays === 1 ? 'day' : 'days'})
                            </span>
                            <span className="font-medium tabular-nums">
                                {formatSource(priceBreakdown.originalTotal ?? priceBreakdown.total, sourceCurrency)}
                            </span>
                        </div>

                    </div>

                    <div className="h-px bg-border my-4" />

                    {isPricingLoading ? (
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-accent rounded animate-pulse w-32" />
                            <div className="h-3 bg-accent rounded animate-pulse w-48" />
                        </div>
                    ) : priceBreakdown.appliedDiscounts && priceBreakdown.appliedDiscounts.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="h-4 w-4 text-success-subtle-foreground" />
                                <span className="text-xs font-semibold text-success-subtle-foreground uppercase tracking-wider">Price adjustments</span>
                            </div>
                            <div className="space-y-1.5">
                                {priceBreakdown.appliedDiscounts.map((discount, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Tag className="h-3 w-3" />
                                            {discount.description}
                                        </span>
                                        <span className={`font-medium tabular-nums ${discount.isDiscount
                                            ? 'text-success-subtle-foreground'
                                            : 'text-warning-subtle-foreground'
                                            }`}>
                                            {discount.percentage}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6">
                        <span className="text-base font-bold text-foreground">Estimated total</span>
                        <div className="text-right">
                            {priceBreakdown.originalTotal && priceBreakdown.totalSavings && priceBreakdown.totalSavings > 0 && (
                                <div className="flex items-center justify-end gap-2 mb-1">
                                    <span className="text-sm line-through text-muted-foreground tabular-nums">
                                        {formatSource(priceBreakdown.originalTotal, sourceCurrency)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-success-subtle text-success-subtle-foreground">
                                        <Sparkles className="h-3 w-3" />
                                        Save {formatSource(priceBreakdown.totalSavings, sourceCurrency)}
                                    </span>
                                </div>
                            )}
                            <span className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
                                {isPricingLoading ? (
                                    <span className="inline-block h-8 w-24 bg-accent rounded animate-pulse" />
                                ) : (
                                    formatSource(priceBreakdown.total, sourceCurrency)
                                )}
                            </span>
                            {!isPricingLoading && isConverted(sourceCurrency) && (
                                <p className="text-xs text-muted-foreground">
                                    {formatPrice(priceBreakdown.total, sourceCurrency)} {describeRateBasis(rateSource)}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Charged in {sourceCurrency}. {isPricingFailed
                                    ? 'The pricing service is unavailable, so this is calculated from the daily rate. The final price is set when your request is reviewed.'
                                    : 'Estimated, final price on review.'}
                            </p>
                        </div>
                    </div>

                    {(unavailableMessage || submitError) && (
                        <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                            {unavailableMessage ?? submitError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base font-bold shadow-md group"
                        disabled={isSubmitting || isPricingLoading || Boolean(unavailableMessage)}
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
                                Request Rental
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <div className="mt-4 flex justify-center items-center gap-2 text-muted-foreground text-xs">
                        <Lock className="h-4 w-4" />
                        No payment now: an administrator reviews your request and payment comes after approval (Stripe test mode demo)
                    </div>
                </div>
            </div>

        </div>
    );
}