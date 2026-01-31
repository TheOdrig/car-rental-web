export const AUTH_EVENTS = {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    REGISTER: 'auth:register',
    SESSION_EXPIRED: 'auth:session_expired',
} as const;

export type AuthEventType = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];

export interface AuthEventPayloads {
    [AUTH_EVENTS.LOGIN]: { userId: number; email: string };
    [AUTH_EVENTS.LOGOUT]: { userId: number };
    [AUTH_EVENTS.REGISTER]: { userId: number; email: string };
    [AUTH_EVENTS.SESSION_EXPIRED]: undefined;
}