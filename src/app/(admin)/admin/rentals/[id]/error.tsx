'use client';

import { SegmentError } from '@/shared/ui/segment-error';

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
            backHref="/admin/rentals"
            backLabel="Back to rentals"
        />
    );
}
