'use client';

import { SegmentError } from '@/shared/ui/segment-error';

export default function AdminUserError({
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
            title="Customer could not be loaded"
            description="The customer details could not be loaded."
            backHref="/admin/users"
            backLabel="Back to users"
        />
    );
}
