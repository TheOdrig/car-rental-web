import { Rental, RentalStatus, type LateReturnStatus, RentalTab, RentalTabCounts, RentalStats, ActionButton } from '../model/types';
import { formatCurrency, formatDate, ownValue } from '@/shared/lib';
import { addCalendarDays, parseLocalDate } from './rental-rules';

export const isActive = (rental: Rental): boolean => {
    return rental.status === RentalStatus.ACTIVE;
};

export const canCancel = (rental: Rental): boolean => {
    return (
        rental.status === RentalStatus.REQUESTED ||
        rental.status === RentalStatus.CONFIRMED
    );
};

export const getFormattedRentalPeriod = (rental: Rental): string => {
    return `${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}`;
};

export const getFormattedTotal = (rental: Rental): string => {
    return formatCurrency(rental.totalPrice, rental.currency ?? 'USD');
};

export function getLateReturnStatusColor(status: LateReturnStatus): string {
    const colors: Record<LateReturnStatus, string> = {
        ON_TIME: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        GRACE_PERIOD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        LATE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        SEVERELY_LATE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status];
}

export function getLateReturnStatusLabel(status: LateReturnStatus): string {
    const labels: Record<LateReturnStatus, string> = {
        ON_TIME: 'On Time',
        GRACE_PERIOD: 'Grace Period',
        LATE: 'Late',
        SEVERELY_LATE: 'Severely Late',
    };
    return labels[status];
}

export function formatLateTime(lateHours: number): string {
    if (lateHours < 24) {
        return `${lateHours}h`;
    }
    const days = Math.floor(lateHours / 24);
    const hours = lateHours % 24;
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

export function getRentalsByTab(rentals: Rental[], tab: RentalTab): Rental[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (tab) {
        case 'all':
            return rentals;
        case 'active':
            return rentals.filter((r) => r.status === RentalStatus.ACTIVE);
        case 'upcoming':
            return rentals.filter((r) => isUpcomingRental(r, today));
        case 'completed':
            return rentals.filter((r) => r.status === RentalStatus.COMPLETED);
        case 'cancelled':
            return rentals.filter((r) => r.status === RentalStatus.CANCELLED);
        default:
            return rentals;
    }
}

export function calculateTabCounts(rentals: Rental[]): RentalTabCounts {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
        all: rentals.length,
        active: rentals.filter((r) => r.status === RentalStatus.ACTIVE).length,
        upcoming: rentals.filter((r) => isUpcomingRental(r, today)).length,
        completed: rentals.filter((r) => r.status === RentalStatus.COMPLETED).length,
        cancelled: rentals.filter((r) => r.status === RentalStatus.CANCELLED).length,
    };
}

export function calculateRentalStats(rentals: Rental[]): RentalStats {
    return {
        totalRentals: rentals.length,
        activeTrips: rentals.filter((r) => r.status === RentalStatus.ACTIVE).length,
    };
}

const ACTION_BUTTONS_CONFIG: Record<string, ActionButton[]> = {
    [RentalStatus.ACTIVE]: [
        { label: 'View Details', action: 'view', variant: 'default' },
    ],
    [RentalStatus.CONFIRMED]: [
        { label: 'View Details', action: 'view', variant: 'ghost' },
        { label: 'Pay Now', action: 'pay', variant: 'default' },
    ],
    [RentalStatus.COMPLETED]: [
        { label: 'Book Again', action: 'book-again', variant: 'default' },
    ],
    [RentalStatus.REQUESTED]: [
        { label: 'View Details', action: 'view', variant: 'ghost' },
        { label: 'Cancel', action: 'cancel', variant: 'destructive' },
    ],
    [RentalStatus.CANCELLED]: [],
};

export function getActionButtons(
    status: RentalStatus,
    options: { startDate?: string; now?: Date } = {}
): ActionButton[] {
    const buttons = ownValue(ACTION_BUTTONS_CONFIG, status as string) ?? [];
    if (status !== RentalStatus.CONFIRMED || !options.startDate) return buttons;
    if (isPaymentWindowOpen(options.startDate, options.now)) return buttons;
    const opensOn = getPaymentOpensOn(options.startDate);
    return buttons.map((button) =>
        button.action === 'pay'
            ? { ...button, disabled: true, hint: opensOn ? `Payment opens on ${formatDate(opensOn)}` : undefined }
            : button
    );
}

export const RENTAL_TABS: { value: RentalTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function getTabLabel(tab: RentalTab): string {
    const found = RENTAL_TABS.find((t) => t.value === tab);
    return found?.label || 'All';
}

export function isUpcomingRental(rental: Rental, now: Date = new Date()): boolean {
    if (rental.status !== RentalStatus.CONFIRMED && rental.status !== RentalStatus.REQUESTED) return false;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = parseLocalDate(rental.startDate) ?? new Date(rental.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate >= today;
}

export const PAYMENT_WINDOW_DAYS = 5;

export function getPaymentOpensOn(startDate: string): Date | null {
    const start = parseLocalDate(startDate);
    if (!start) return null;
    return addCalendarDays(start, -PAYMENT_WINDOW_DAYS);
}

export function isPaymentWindowOpen(startDate: string, now: Date = new Date()): boolean {
    const opensOn = getPaymentOpensOn(startDate);
    if (!opensOn) return true;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today >= opensOn;
}

export function getStatusBadgeVariant(
    status: RentalStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case RentalStatus.ACTIVE:
            return 'default';
        case RentalStatus.CONFIRMED:
            return 'secondary';
        case RentalStatus.COMPLETED:
            return 'outline';
        case RentalStatus.REQUESTED:
            return 'secondary';
        case RentalStatus.CANCELLED:
            return 'destructive';
        default:
            return 'outline';
    }
}

export function formatRentalDuration(days: number): string {
    if (days === 1) return '1 day';
    return `${days} days`;
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}