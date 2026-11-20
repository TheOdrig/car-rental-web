'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, FileText } from 'lucide-react';
import { DocumentTitle } from '@/shared/ui/document-title';
import { toast } from 'sonner';
import { getCarUnavailableMessage, isAvailable, useBookedDates, useCar, usePricingPreview } from '@/entities/car';
import { CAR_BOOKED_MESSAGE, findBookedDate, parseLocalDate } from '@/entities/rental';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { ErrorMessage } from '@/shared/ui/error-message';
import { calculateRentalDays, getBookingErrorMessage, monthKeysBetween } from '../../lib/utils';
import { useCreateBooking } from '../../lib/use-checkout';
import { BookingSummary } from './booking-summary';
import { CheckoutSkeleton } from './checkout-skeleton';
import type { DiscountDetail, PriceBreakdown } from '../../model/types';
import { ROUTES } from '@/shared/config/routes';

const NOTES_MAX_LENGTH = 1000;

interface CheckoutFormProps {
    carId: string;
    startDate: string;
    endDate: string;
}

export function CheckoutForm({ carId, startDate, endDate }: CheckoutFormProps) {
    const router = useRouter();
    const {
        data: carData,
        isLoading: carLoading,
        error: carError,
        refetch: refetchCar,
    } = useCar(Number(carId));
    const {
        data: pricingData,
        isLoading: pricingLoading,
        isError: pricingFailed,
    } = usePricingPreview(Number(carId), startDate, endDate);

    const rangeStart = parseLocalDate(startDate);
    const rangeEnd = parseLocalDate(endDate);
    const months = useMemo(
        () => (rangeStart && rangeEnd ? monthKeysBetween(rangeStart, rangeEnd) : []),
        [rangeStart, rangeEnd]
    );
    const { booked, blockedReason } = useBookedDates(Number(carId), months);
    const bookedConflict = rangeStart && rangeEnd ? findBookedDate(rangeStart, rangeEnd, booked) : null;

    const [notes, setNotes] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submitted = useRef(false);

    const booking = useCreateBooking({
        onSuccess: (created) => {
            router.replace(ROUTES.booking.success(created.id));
        },
        onError: (error) => {
            submitted.current = false;
            const message = getBookingErrorMessage(error);
            setSubmitError(message);
            toast.error(message);
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (submitted.current || booking.isPending || booking.isSuccess) return;
        submitted.current = true;
        setSubmitError(null);
        const trimmed = notes.trim();
        booking.mutate({
            carId: Number(carId),
            startDate,
            endDate,
            ...(trimmed ? { notes: trimmed } : {}),
        });
    };

    const car = carData?.car;

    const rentalDays = useMemo(() => {
        if (pricingData?.rentalDays) return pricingData.rentalDays;
        const start = parseLocalDate(startDate);
        const end = parseLocalDate(endDate);
        if (!start || !end) return 1;
        return calculateRentalDays(start, end);
    }, [pricingData, startDate, endDate]);

    const appliedDiscounts: DiscountDetail[] = useMemo(() => {
        if (!pricingData?.appliedModifiers) return [];
        return pricingData.appliedModifiers.map((mod) => ({
            name: mod.strategyName,
            description: mod.description,
            percentage: mod.formattedPercentage,
            isDiscount: mod.isDiscount,
        }));
    }, [pricingData]);

    const priceBreakdown: PriceBreakdown | null = useMemo(() => {
        if (!car) return null;

        const dailyRate = pricingData?.effectiveDailyPrice ?? car.price;
        const total = pricingData?.finalPrice ?? dailyRate * rentalDays;

        return {
            rentalDays,
            dailyRate,
            total,
            currency: car.currencyType,
            originalDailyRate: pricingData?.basePrice,
            originalTotal: pricingData?.baseTotalPrice,
            totalSavings: pricingData?.totalSavings,
            appliedDiscounts: appliedDiscounts.length > 0 ? appliedDiscounts : undefined,
            isEstimate: !pricingData,
        };
    }, [car, pricingData, rentalDays, appliedDiscounts]);

    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    if (carLoading) {
        return <CheckoutSkeleton />;
    }

    if (carError) {
        return (
            <ErrorMessage
                title="Could not load the car"
                message="The selected car could not be loaded. Check your connection and try again."
                onRetry={() => void refetchCar()}
            />
        );
    }

    if (!car || !priceBreakdown || !start || !end) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <DocumentTitle title="Car Not Found" />
                    <h1 className="text-xl font-bold text-foreground mb-2">Car Not Found</h1>
                    <p className="text-muted-foreground">The selected car could not be loaded.</p>
                </div>
            </div>
        );
    }

    const isSubmitting = booking.isPending || booking.isSuccess;
    const unavailableMessage = isAvailable(car)
        ? (blockedReason ?? (bookedConflict ? CAR_BOOKED_MESSAGE : null))
        : getCarUnavailableMessage(car.carStatusType);

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                            <Clock className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">
                                How this works
                            </h2>
                        </div>
                        <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
                            <li>You send a rental request for the dates shown here.</li>
                            <li>An administrator reviews it and approves or rejects it.</li>
                            <li>Payment comes after approval, from your rental page.</li>
                        </ol>
                    </section>

                    <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">
                                Notes for the administrator
                            </h2>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="booking-notes" className="text-sm font-medium">
                                Optional
                            </Label>
                            <Textarea
                                id="booking-notes"
                                value={notes}
                                maxLength={NOTES_MAX_LENGTH}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Anything the administrator should know about this request"
                                rows={4}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                {notes.length}/{NOTES_MAX_LENGTH}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                The administrator sees this note with your request, and it stays on your rental page.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <BookingSummary
                        car={car}
                        startDate={start}
                        endDate={end}
                        priceBreakdown={priceBreakdown}
                        isPricingLoading={pricingLoading}
                        isPricingFailed={pricingFailed}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        unavailableMessage={unavailableMessage}
                    />
                </div>
            </div>
        </form>
    );
}
