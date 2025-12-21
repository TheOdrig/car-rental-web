'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useRental } from '@/lib/hooks';
import { RentalDetail, RentalDetailSkeleton } from '@/components/rentals';

interface RentalDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function RentalDetailPage({ params }: RentalDetailPageProps) {
    const { id } = use(params);
    const rentalId = parseInt(id, 10);

    if (isNaN(rentalId)) {
        notFound();
    }

    const { data: rental, isLoading, error } = useRental(rentalId);

    if (isLoading) {
        return (
            <div className="container py-8">
                <RentalDetailSkeleton />
            </div>
        );
    }

    if (error || !rental) {
        notFound();
    }

    return (
        <div className="container py-8">
            <RentalDetail rental={rental} />
        </div>
    );
}
