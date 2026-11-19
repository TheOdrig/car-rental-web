import { ownValue } from '@/shared/lib/utils';
import { RENTAL_STATUS_LABELS } from '@/entities/rental';

export type PendingRentalsType = 'approvals' | 'pickups' | 'returns' | 'overdue';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusDisplay {
    label: string;
    className: string;
    variant: BadgeVariant;
}

const STATUS_CONFIG: Record<string, StatusDisplay> = {
    REQUESTED: {
        label: RENTAL_STATUS_LABELS.REQUESTED,
        variant: 'secondary',
        className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    },
    CONFIRMED: {
        label: RENTAL_STATUS_LABELS.CONFIRMED,
        variant: 'default',
        className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
    IN_USE: {
        label: RENTAL_STATUS_LABELS.IN_USE,
        variant: 'secondary',
        className: 'bg-violet-500 hover:bg-violet-600 text-white',
    },
    OVERDUE: {
        label: 'Overdue',
        variant: 'destructive',
        className: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    CANCELLED: {
        label: RENTAL_STATUS_LABELS.CANCELLED,
        variant: 'outline',
        className: 'text-slate-500 border-slate-200 dark:border-slate-800',
    },
    RETURNED: {
        label: RENTAL_STATUS_LABELS.RETURNED,
        variant: 'default',
        className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
};

export function getStatusDisplay(status: string): StatusDisplay {
    return (
        ownValue(STATUS_CONFIG, status?.toUpperCase()) ?? {
            label: status,
            variant: 'outline',
            className: '',
        }
    );
}
