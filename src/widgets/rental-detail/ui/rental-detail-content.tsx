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
import { ROUTES } from '@/shared/config/routes';
import { useNumericParam } from '@/shared/lib/use-numeric-param';

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

function RentalDetailLoading() {
    return (
        <div className="container py-8">
            <BreadcrumbLoader />
            <RentalDetailSkeleton />
        </div>
    );
}

function RentalLoadError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="container py-8">
            <ErrorMessage
                title="Failed to load the rental"
                message="Please check your connection and try again."
                onRetry={onRetry}
            />
        </div>
    );
}

export function RentalDetailContent({ id }: { id: string }) {
    const router = useRouter();
    const rentalId = useNumericParam(id);

    const { data: rental, isLoading, error, refetch } = useRental(rentalId);
    const { data: profile } = useProfile();
    const driverName = personFullName(profile);

    const handleCancelSuccess = () => {
        router.push(ROUTES.rentals.list);
    };

    if (isLoading) return <RentalDetailLoading />;

    if (isNotFoundError(error)) notFound();

    if (error) return <RentalLoadError onRetry={() => void refetch()} />;

    if (!rental) {
        notFound();
    }

    return (
        <div className="container py-8">
            <Breadcrumb
                items={[
                    { label: 'Rentals', href: ROUTES.rentals.list },
                    { label: `Rental ${formatRentalReference(rental.id)}` },
                ]}
                className="mb-6"
            />
            <RentalDetail rental={rental} driverName={driverName || undefined} onCancelSuccess={handleCancelSuccess} />
        </div>
    );
}