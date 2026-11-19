export type CancelledBy = 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
export type CancellationAudience = 'customer' | 'admin';

const CANCELLED_BY_LABELS: Record<CancellationAudience, Record<CancelledBy, string>> = {
    customer: {
        CUSTOMER: 'Cancelled by you',
        ADMIN: 'Cancelled by our team',
        SYSTEM: 'Cancelled automatically (payment not completed)',
    },
    admin: {
        CUSTOMER: 'Cancelled by the customer',
        ADMIN: 'Cancelled by an admin',
        SYSTEM: 'Cancelled automatically (payment not completed)',
    },
};

const FALLBACK_LABEL = 'Cancelled';

function isCancelledBy(value: string | undefined | null): value is CancelledBy {
    return value === 'CUSTOMER' || value === 'ADMIN' || value === 'SYSTEM';
}

export function getCancelledByLabel(
    cancelledBy: string | undefined | null,
    audience: CancellationAudience = 'customer'
): string {
    return isCancelledBy(cancelledBy) ? CANCELLED_BY_LABELS[audience][cancelledBy] : FALLBACK_LABEL;
}
