import type { Metadata } from 'next';
import { BookingFailure } from '@/components/booking/booking-failure';

export const metadata: Metadata = {
    title: 'Payment Failed | Car Rental',
    description: 'Your payment could not be processed. Please try again.',
};

interface FailurePageProps {
    searchParams: Promise<{
        error?: string;
        code?: string;
    }>;
}

export default async function BookingFailurePage({ searchParams }: FailurePageProps) {
    const params = await searchParams;
    const { error, code } = params;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BookingFailure
                errorMessage={error}
                errorCode={code}
            />
        </main>
    );
}

