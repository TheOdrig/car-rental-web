'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { clientPost } from '@/shared/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCar } from '@/entities/car';
import { parseLocalDate } from '@/entities/rental';
import { usePricingPreview } from '@/entities/car';
import { useCurrentUser } from '@/entities/user';
import { checkoutFormSchema, type CheckoutFormSchema } from '@/features/book-car';
import { calculateRentalDays, getBookingErrorMessage } from '@/features/book-car';
import { PersonalDetails } from './personal-details';
import { BookingSummary } from './booking-summary';
import { CheckoutSkeleton } from './checkout-skeleton';
import type { DiscountDetail, PriceBreakdown } from '@/features/book-car';
import type { Car } from '@/entities/car';

interface CheckoutFormProps {
    carId: string;
    startDate: string;
    endDate: string;
    pickupLocation?: string;
    dropoffLocation?: string;
}

export function CheckoutForm({
    carId,
    startDate,
    endDate,
    pickupLocation = 'Main Office',
    dropoffLocation,
}: CheckoutFormProps) {
    const router = useRouter();
    const { user } = useCurrentUser();
    const { data: carData, isLoading: carLoading, error: carError } = useCar(Number(carId));
    const { data: pricingData, isLoading: pricingLoading } = usePricingPreview(
        Number(carId),
        startDate,
        endDate
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CheckoutFormSchema>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (data: CheckoutFormSchema) => {
        setIsSubmitting(true);

        try {
            const booking = await clientPost<{ id: number }>('/api/rentals', {
                carId: Number(carId),
                startDate,
                endDate,
                pickupLocation,
                dropoffLocation: dropoffLocation || pickupLocation,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
            });
            router.push(`/booking/success?ref=${booking.id}`);
        } catch (error) {
            const message = getBookingErrorMessage(error);
            router.push(`/booking/failure?error=${encodeURIComponent(message || 'Booking failed')}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const car = ((carData as unknown as { car?: Car })?.car || carData) as Car | undefined;

    const rentalDays = useMemo(() => {
        if (pricingData?.rentalDays) return pricingData.rentalDays;
        return calculateRentalDays(parseLocalDate(startDate) ?? new Date(startDate), parseLocalDate(endDate) ?? new Date(endDate));
    }, [pricingData?.rentalDays, startDate, endDate]);

    const appliedDiscounts: DiscountDetail[] = useMemo(() => {
        if (!pricingData?.appliedModifiers) return [];
        return pricingData.appliedModifiers.map((mod) => ({
            name: mod.strategyName,
            description: mod.description,
            percentage: mod.formattedPercentage,
            isDiscount: mod.isDiscount,
        }));
    }, [pricingData?.appliedModifiers]);

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
        };
    }, [car, pricingData, rentalDays, appliedDiscounts]);

    if (carLoading) {
        return <CheckoutSkeleton />;
    }

    if (carError || !car || !priceBreakdown) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">Car Not Found</h2>
                    <p className="text-muted-foreground">The selected car could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    <PersonalDetails
                        control={form.control}
                        errors={form.formState.errors}
                        isLoggedIn={!!user}
                    />

                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <BookingSummary
                        car={car}
                        startDate={new Date(startDate)}
                        endDate={new Date(endDate)}
                        pickupLocation={pickupLocation}
                        dropoffLocation={dropoffLocation || pickupLocation}
                        priceBreakdown={priceBreakdown}
                        isPricingLoading={pricingLoading}
                        isSubmitting={isSubmitting}
                        isFormValid={form.formState.isValid}
                    />
                </div>
            </div>
        </form>
    );
}
