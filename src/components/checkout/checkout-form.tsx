'use client';

import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCar } from '@/lib/hooks/use-cars';
import { usePricingPreview } from '@/lib/hooks/use-pricing';
import { useAuth } from '@/lib/hooks';
import { checkoutFormSchema, type CheckoutFormSchema } from '@/lib/validations/checkout';
import { calculatePriceBreakdown, calculateRentalDays, DEFAULT_ADDONS } from '@/lib/utils/checkout-utils';
import { PersonalDetails } from './personal-details';
import { PaymentForm } from './payment-form';
import { ProtectionExtras } from './protection-extras';
import { BookingSummary } from './booking-summary';
import { CheckoutSkeleton } from './checkout-skeleton';
import type { Car, DiscountDetail, PriceBreakdown } from '@/types';

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
    const { user } = useAuth();
    const { data: carData, isLoading: carLoading, error: carError } = useCar(Number(carId));
    const { data: pricingData, isLoading: pricingLoading } = usePricingPreview(
        Number(carId),
        startDate,
        endDate
    );

    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CheckoutFormSchema>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: '',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            cardholderName: '',
            addons: [],
        },
        mode: 'onChange',
    });

    const handleAddonChange = useCallback((addonId: string, selected: boolean) => {
        setSelectedAddons((prev) =>
            selected ? [...prev, addonId] : prev.filter((id) => id !== addonId)
        );
    }, []);

    const onSubmit = async (data: CheckoutFormSchema) => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/rentals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId: Number(carId),
                    startDate,
                    endDate,
                    pickupLocation,
                    dropoffLocation: dropoffLocation || pickupLocation,
                    addons: selectedAddons,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                router.push(`/booking/failure?error=${encodeURIComponent(error.message || 'Payment failed')}`);
                return;
            }

            const booking = await response.json();
            router.push(`/booking/success?ref=${booking.id}`);
        } catch {
            router.push('/booking/failure?error=An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const car = ((carData as unknown as { car?: Car })?.car || carData) as Car | undefined;

    const rentalDays = useMemo(() => {
        return calculateRentalDays(new Date(startDate), new Date(endDate));
    }, [startDate, endDate]);

    const selectedAddonObjects = useMemo(() => {
        return DEFAULT_ADDONS.filter((addon) => selectedAddons.includes(addon.id));
    }, [selectedAddons]);

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

        const effectiveDailyRate = pricingData?.effectiveDailyPrice ?? car.price;
        const baseDailyRate = pricingData?.basePrice ?? car.price;

        const base = calculatePriceBreakdown(
            effectiveDailyRate,
            rentalDays,
            selectedAddonObjects,
            car.currencyType
        );

        const originalTotal = pricingData
            ? baseDailyRate * rentalDays + base.addonsCost + (baseDailyRate * rentalDays + base.addonsCost) * 0.12
            : undefined;

        return {
            ...base,
            originalDailyRate: pricingData ? baseDailyRate : undefined,
            originalTotal: originalTotal ? Math.round(originalTotal * 100) / 100 : undefined,
            totalSavings: pricingData?.totalSavings,
            appliedDiscounts: appliedDiscounts.length > 0 ? appliedDiscounts : undefined,
        };
    }, [car, pricingData, rentalDays, selectedAddonObjects, appliedDiscounts]);

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

                    <PaymentForm
                        control={form.control}
                        errors={form.formState.errors}
                    />

                    <ProtectionExtras
                        addons={DEFAULT_ADDONS}
                        selectedAddons={selectedAddons}
                        onAddonChange={handleAddonChange}
                        rentalDays={rentalDays}
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

