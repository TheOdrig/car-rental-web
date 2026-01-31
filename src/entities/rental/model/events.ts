export const RENTAL_EVENTS = {
    APPROVED: 'rental:approved',
    REJECTED: 'rental:rejected',
    PICKED_UP: 'rental:picked_up',
    RETURNED: 'rental:returned',
    CANCELLED: 'rental:cancelled',
    UPDATED: 'rental:updated',
} as const;

export type RentalEventType = typeof RENTAL_EVENTS[keyof typeof RENTAL_EVENTS];
