'use client';

import { useRouter, notFound } from 'next/navigation';
import { useRental } from '@/entities/rental';
import { RentalDetail, RentalDetailSkeleton } from '@/features/manage-rentals';
import { Breadcrumb } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/skeleton';

function BreadcrumbLoader() {
    return (
        <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

export function RentalDetailContent({ id }: { id: string }) {
    const router = useRouter();
    const rentalId = parseInt(id, 10);

    const { data: rental, isLoading, error } = useRental(rentalId);

    const handleCancelSuccess = () => {
        router.push('/rentals');
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <BreadcrumbLoader />
                <RentalDetailSkeleton />
            </div>
        );
    }

    if (error || !rental) {
        notFound();
    }

    return (
        <div className="container py-8">
            <Breadcrumb
                items={[
                    { label: 'Rentals', href: '/rentals' },
                    { label: `Order #${rental.id}` },
                ]}
                className="mb-6"
            />
            <RentalDetail rental={rental} onCancelSuccess={handleCancelSuccess} />
        </div>
    );
}