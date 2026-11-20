'use client';

import { SegmentError } from '@/shared/ui/segment-error';
import { ROUTES } from '@/shared/config/routes';

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
            backHref={ROUTES.admin.users}
            backLabel="Back to users"
        />
    );
}
