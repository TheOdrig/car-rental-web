export type DomainEvent =
    | { type: 'USER_LOGGED_IN'; payload: { userId: number; email: string } }
    | { type: 'USER_LOGGED_OUT'; payload: { userId: number } }
    | { type: 'RENTAL_CREATED'; payload: { rentalId: number; carId: number; userId: number } }
    | { type: 'RENTAL_CANCELLED'; payload: { rentalId: number; reason?: string } }
    | { type: 'RENTAL_COMPLETED'; payload: { rentalId: number } }
    | { type: 'DAMAGE_ASSESSED'; payload: { rentalId: number; damageId: number; severity: string } }
    | { type: 'DAMAGE_RESOLVED'; payload: { damageId: number } }
    | { type: 'CURRENCY_CHANGED'; payload: { currency: string } };

export type EventType = DomainEvent['type'];
export type EventPayload<T extends EventType> = Extract<DomainEvent, { type: T }>['payload'];
