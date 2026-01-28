export const BOOKING_ENDPOINTS = {
    CREATE: '/rentals',
    GET_AVAILABLE_CARS: '/cars/available',
    GET_BOOKING: (id: number) => `/rentals/${id}`,
    CANCEL_BOOKING: (id: number) => `/rentals/${id}/cancel`,
} as const;
