const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const RENTAL_ENDPOINTS = {
    list: `${API_BASE_URL}/api/rentals/admin`,
    me: `${API_BASE_URL}/api/rentals/me`,
    byId: (id: number) => `${API_BASE_URL}/api/rentals/${id}`,
    request: `${API_BASE_URL}/api/rentals/request`,
    confirm: (id: number) => `${API_BASE_URL}/api/rentals/${id}/confirm`,
    cancel: (id: number) => `${API_BASE_URL}/api/rentals/${id}/cancel`,
    pickup: (id: number) => `${API_BASE_URL}/api/rentals/${id}/pickup`,
    return: (id: number) => `${API_BASE_URL}/api/rentals/${id}/return`,
} as const;