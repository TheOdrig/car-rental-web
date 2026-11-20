'use client';

import { useRouter, notFound } from 'next/navigation';
import { useRental } from '@/entities/rental';
import { useProfile } from '@/features/user-settings';
import { formatRentalReference, personFullName } from '@/shared/lib';
import { RentalDetail, RentalDetailSkeleton } from '@/features/manage-rentals';
import { Breadcrumb } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { isNotFoundError } from '@/shared/api';

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

    const { data: rental, isLoading, error, refetch } = useRental(rentalId);
    const { data: profile } = useProfile();
    const driverName = personFullName(profile);

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

    if (isNotFoundError(error)) {
        notFound();
    }

    if (error) {
        return (
            <div className="container py-8">
                <ErrorMessage
                    title="Failed to load the rental"
                    message="Please check your connection and try again."
                    onRetry={() => void refetch()}
                />
            </div>
        );
    }

    if (!rental) {
        notFound();
    }

    return (
        <div className="container py-8">
            <Breadcrumb
                items={[
                    { label: 'Rentals', href: '/rentals' },
                    { label: `Rental ${formatRentalReference(rental.id)}` },
                ]}
                className="mb-6"
            />
            <RentalDetail rental={rental} driverName={driverName || undefined} onCancelSuccess={handleCancelSuccess} />
        </div>
    );
}