import type { Metadata } from 'next';
import Link from 'next/link';
import { BookingSuccessLoader } from '@/features/book-car';

export const metadata: Metadata = {
    title: 'Booking Requested | Car Rental',
    description: 'Your car rental request has been submitted and awaits confirmation.',
    robots: { index: false, follow: false },
};

interface SuccessPageProps {
    searchParams: Promise<{
        ref?: string;
    }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
    const { ref } = await searchParams;

    if (!ref || !/^\d+$/.test(ref)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">No booking reference</h1>
                    <p className="text-muted-foreground mb-6">
                        This page needs a booking reference. You can find your requests on your rentals page.
                    </p>
                    <Link
                        href="/rentals"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        My Rentals
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BookingSuccessLoader referenceNumber={ref} />
        </div>
    );
}
