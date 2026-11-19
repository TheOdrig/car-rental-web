import type { Metadata } from 'next';
import { BookingFailure } from '@/features/book-car';

export const metadata: Metadata = {
    title: 'Booking Failed',
    description: 'Your booking request could not be submitted. Please try again.',
    robots: { index: false, follow: false },
};

interface FailurePageProps {
    searchParams: Promise<{
        error?: string;
    }>;
}

export default async function BookingFailurePage({ searchParams }: FailurePageProps) {
    const params = await searchParams;
    const { error } = params;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BookingFailure errorMessage={error} />
        </div>
    );
}