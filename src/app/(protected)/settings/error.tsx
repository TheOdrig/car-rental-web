'use client';

import { SegmentError } from '@/shared/ui/segment-error';
import { ROUTES } from '@/shared/config/routes';

export default function SettingsError({
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
            title="Settings could not be loaded"
            description="Your settings could not be loaded. Try again, or go back to your rentals."
            backHref={ROUTES.rentals.list}
            backLabel="My rentals"
        />
    );
}
