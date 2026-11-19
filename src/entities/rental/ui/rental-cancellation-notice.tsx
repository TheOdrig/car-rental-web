import { cn } from '@/shared/lib';
import { getCancelledByLabel, type CancellationAudience } from '../lib/rental-cancellation';

interface RentalCancellationNoticeProps {
    cancelledBy?: string | null;
    reason?: string | null;
    audience?: CancellationAudience;
    className?: string;
}

export function RentalCancellationNotice({ cancelledBy, reason, audience = 'customer', className }: RentalCancellationNoticeProps) {
    const trimmed = reason?.trim();

    if (!cancelledBy && !trimmed) return null;

    return (
        <div className={cn('space-y-1 text-sm text-red-600 dark:text-red-400', className)} data-testid="cancellation-notice">
            <p className="font-medium" data-testid="cancellation-by">
                {getCancelledByLabel(cancelledBy, audience)}
            </p>
            {trimmed && (
                <p className="break-words" data-testid="cancellation-reason">
                    Reason: {trimmed}
                </p>
            )}
        </div>
    );
}
