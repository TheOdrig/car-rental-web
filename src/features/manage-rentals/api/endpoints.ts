export const RENTAL_ENDPOINTS = {
    GET_RENTALS: '/rentals',
    GET_RENTAL: (id: number) => `/rentals/${id}`,
    APPROVE: (id: number) => `/rentals/${id}/approve`,
    REJECT: (id: number) => `/rentals/${id}/reject`,
    PICKUP: (id: number) => `/rentals/${id}/pickup`,
    RETURN: (id: number) => `/rentals/${id}/return`,
    CANCEL: (id: number) => `/rentals/${id}/cancel`,
} as const;
