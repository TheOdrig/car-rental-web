export const AUTH_EVENTS = {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    REGISTER: 'auth:register',
    SESSION_EXPIRED: 'auth:session_expired',
} as const;

export const BOOKING_EVENTS = {
    CREATED: 'booking:created',
    UPDATED: 'booking:updated',
    CANCELLED: 'booking:cancelled',
} as const;

export type AuthEventType = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];
export type BookingEventType = typeof BOOKING_EVENTS[keyof typeof BOOKING_EVENTS];
