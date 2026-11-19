import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckoutForm } from '@/features/book-car';
import { CheckoutSkeleton } from '@/features/book-car';
import { rentalDatesSchema } from '@/entities/rental';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Review and send your car rental request.',
    robots: { index: false, follow: false },
};

interface CheckoutPageProps {
    searchParams: Promise<{
        carId?: string;
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
    const params = await searchParams;
    const { carId, startDate, endDate } = params;

    if (!carId || !startDate || !endDate) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Missing Booking Information
                    </h1>
                    <p className="text-muted-foreground mb-6">
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

    const dateCheck = rentalDatesSchema.safeParse({ startDate, endDate });
    if (!dateCheck.success) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Invalid Rental Dates
                    </h1>
                    <p className="text-muted-foreground mb-6" role="alert">
                        {dateCheck.error.issues[0]?.message}
                    </p>
                    <Link
                        href={`/cars/${carId}`}
                        className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Choose Different Dates
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div>
                <nav className="flex mb-8 text-sm font-medium text-slate-600 dark:text-slate-400">
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

                <h1 className="mb-8 text-3xl font-bold">
                    Checkout
                </h1>

                <Suspense fallback={<CheckoutSkeleton />}>
                    <CheckoutForm
                        carId={carId}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Suspense>
            </div>
        </div>
    );
}
