'use client';

import { SegmentError } from '@/shared/ui/segment-error';

export default function AdminVehicleError({
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
            title="Vehicle could not be loaded"
            description="The vehicle details could not be loaded."
            backHref="/admin/fleet"
            backLabel="Back to fleet"
        />
    );
}
