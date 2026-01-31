const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const CAR_ENDPOINTS = {
    list: `${API_BASE_URL}/api/cars`,
    active: `${API_BASE_URL}/api/cars/active`,
    featured: `${API_BASE_URL}/api/cars/featured`,
    byId: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
    byLicensePlate: (plate: string) => `${API_BASE_URL}/api/cars/licensePlate/${plate}`,
    search: `${API_BASE_URL}/api/cars/search`,
    filterOptions: `${API_BASE_URL}/api/cars/filter-options`,
    availability: {
        search: `${API_BASE_URL}/api/cars/availability/search`,
        calendar: (id: number) => `${API_BASE_URL}/api/cars/${id}/availability/calendar`,
        similar: (id: number) => `${API_BASE_URL}/api/cars/${id}/similar`,
    },
    admin: {
        list: `${API_BASE_URL}/api/cars`,
        create: `${API_BASE_URL}/api/cars`,
        byId: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
        update: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
        delete: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
        updateStatus: (id: number) => `${API_BASE_URL}/api/cars/business/${id}/status`,
    },
} as const;