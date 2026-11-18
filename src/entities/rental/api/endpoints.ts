export const RENTAL_ENDPOINTS = {
    list: `/api/rentals/admin`,
    me: `/api/rentals/me`,
    byId: (id: number) => `/api/rentals/${id}`,
    request: `/api/rentals/request`,
    confirm: (id: number) => `/api/rentals/${id}/confirm`,
    cancel: (id: number) => `/api/rentals/${id}/cancel`,
    pickup: (id: number) => `/api/rentals/${id}/pickup`,
    return: (id: number) => `/api/rentals/${id}/return`,
} as const;