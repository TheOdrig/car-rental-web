import type { Metadata } from 'next';
import { BookingSuccess } from '@/features/book-car';

export const metadata: Metadata = {
    title: 'Booking Requested | Car Rental',
    description: 'Your car rental request has been submitted and awaits confirmation.',
};

interface SuccessPageProps {
    searchParams: Promise<{
        ref?: string;
        car?: string;
        start?: string;
        end?: string;
        location?: string;
    }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const {
        ref = 'UNKNOWN',
        car,
        start,
        end,
        location,
    } = params;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BookingSuccess
                referenceNumber={ref}
                carName={car}
                startDate={start ? new Date(start) : undefined}
                endDate={end ? new Date(end) : undefined}
                pickupLocation={location}
            />
        </main>
    );
}