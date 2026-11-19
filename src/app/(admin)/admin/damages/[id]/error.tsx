'use client';

import { SegmentError } from '@/shared/ui/segment-error';

export default function AdminDamageError({
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
            title="Damage report could not be loaded"
            description="The damage report could not be loaded."
            backHref="/admin/damages"
            backLabel="Back to damages"
        />
    );
}
