'use client';

import { SegmentError } from '@/shared/ui/segment-error';
import { ROUTES } from '@/shared/config/routes';

export default function AdminRentalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <SegmentError
            error={error}
            reset={reset}
            title="Rental could not be loaded"
            description="The rental details could not be loaded."
            backHref={ROUTES.admin.rentals}
            backLabel="Back to rentals"
        />
    );
}
