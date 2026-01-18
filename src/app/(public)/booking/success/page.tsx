import type { Metadata } from 'next';
import { BookingSuccess } from '@/components/booking/booking-success';

export const metadata: Metadata = {
    title: 'Booking Confirmed | Car Rental',
    description: 'Your car rental booking has been successfully confirmed.',
};

interface SuccessPageProps {
    searchParams: Promise<{
        ref?: string;
        car?: string;
        start?: string;
        end?: string;
        location?: string;
        total?: string;
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
        total,
    } = params;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BookingSuccess
                referenceNumber={ref}
                carName={car}
                startDate={start ? new Date(start) : undefined}
                endDate={end ? new Date(end) : undefined}
                pickupLocation={location}
                totalPaid={total ? parseFloat(total) : undefined}
            />
        </main>
    );
}
