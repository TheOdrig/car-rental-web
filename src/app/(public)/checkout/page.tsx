import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout';
import { CheckoutSkeleton } from '@/components/checkout';

export const metadata: Metadata = {
    title: 'Checkout | Car Rental',
    description: 'Complete your car rental booking securely.',
};

interface CheckoutPageProps {
    searchParams: Promise<{
        carId?: string;
        startDate?: string;
        endDate?: string;
        pickupLocation?: string;
        dropoffLocation?: string;
    }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
    const params = await searchParams;
    const { carId, startDate, endDate, pickupLocation, dropoffLocation } = params;

    if (!carId || !startDate || !endDate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Missing Booking Information
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Please select a car and dates to proceed with checkout.
                    </p>
                    <Link
                        href="/cars"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Browse Cars
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <nav className="flex mb-8 text-sm font-medium text-muted-foreground">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="/cars" className="hover:text-primary transition-colors">
                                Select Car
                            </Link>
                        </li>
                        <li>
                            <ChevronRight className="h-4 w-4" />
                        </li>
                        <li>
                            <Link
                                href={`/cars/${carId}`}
                                className="hover:text-primary transition-colors"
                            >
                                Details
                            </Link>
                        </li>
                        <li>
                            <ChevronRight className="h-4 w-4" />
                        </li>
                        <li aria-current="page" className="text-primary font-bold">
                            Checkout
                        </li>
                    </ol>
                </nav>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                    Checkout
                </h1>

                <Suspense fallback={<CheckoutSkeleton />}>
                    <CheckoutForm
                        carId={carId}
                        startDate={startDate}
                        endDate={endDate}
                        pickupLocation={pickupLocation}
                        dropoffLocation={dropoffLocation}
                    />
                </Suspense>
            </div>
        </main>
    );
}
