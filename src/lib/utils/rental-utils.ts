import type {
    Rental,
    RentalStatus,
    RentalTab,
    RentalTabCounts,
    RentalStats,
    ActionButton,
} from '@/types';

export function getRentalsByTab(rentals: Rental[], tab: RentalTab): Rental[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (tab) {
        case 'all':
            return rentals;

        case 'active':
            return rentals.filter((r) => r.status === 'In Use');

        case 'upcoming':
            return rentals.filter((r) => {
                if (r.status !== 'Confirmed') return false;
                const startDate = new Date(r.startDate);
                startDate.setHours(0, 0, 0, 0);
                return startDate > today;
            });

        case 'completed':
            return rentals.filter((r) => r.status === 'Returned');

        case 'cancelled':
            return rentals.filter((r) => r.status === 'Cancelled');

        default:
            return rentals;
    }
}

export function calculateTabCounts(rentals: Rental[]): RentalTabCounts {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
        all: rentals.length,
        active: rentals.filter((r) => r.status === 'In Use').length,
        upcoming: rentals.filter((r) => {
            if (r.status !== 'Confirmed') return false;
            const startDate = new Date(r.startDate);
            startDate.setHours(0, 0, 0, 0);
            return startDate > today;
        }).length,
        completed: rentals.filter((r) => r.status === 'Returned').length,
        cancelled: rentals.filter((r) => r.status === 'Cancelled').length,
    };
}

export function calculateRentalStats(
    rentals: Rental[],
    loyaltyPoints: number = 0
): RentalStats {
    return {
        totalRentals: rentals.length,
        activeTrips: rentals.filter((r) => r.status === 'In Use').length,
        loyaltyPoints,
    };
}


const ACTION_BUTTONS_CONFIG: Record<RentalStatus, ActionButton[]> = {
    'In Use': [
        { label: 'Extend Trip', action: 'extend', variant: 'outline' },
        { label: 'Modify Booking', action: 'modify', variant: 'default' },
    ],
    Confirmed: [
        { label: 'View Details', action: 'view', variant: 'ghost' },
    ],
    Returned: [
        { label: 'Receipt', action: 'receipt', variant: 'ghost', icon: 'receipt' },
        { label: 'Book Again', action: 'book-again', variant: 'default' },
    ],
    Requested: [
        { label: 'View Details', action: 'view', variant: 'ghost' },
        { label: 'Cancel', action: 'cancel', variant: 'destructive' },
    ],
    Cancelled: [],
};

export function getActionButtons(status: RentalStatus): ActionButton[] {
    return ACTION_BUTTONS_CONFIG[status] || [];
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

export function isUpcomingRental(rental: Rental): boolean {
    if (rental.status !== 'Confirmed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(rental.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate > today;
}

export function getStatusBadgeVariant(
    status: RentalStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'In Use':
            return 'default';
        case 'Confirmed':
            return 'secondary';
        case 'Returned':
            return 'outline';
        case 'Requested':
            return 'secondary';
        case 'Cancelled':
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
