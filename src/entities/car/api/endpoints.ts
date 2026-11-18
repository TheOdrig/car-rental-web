export const CAR_ENDPOINTS = {
    list: `/api/cars`,
    active: `/api/cars/active`,
    byId: (id: number) => `/api/cars/${id}`,
    byLicensePlate: (plate: string) => `/api/cars/licensePlate/${plate}`,
    search: `/api/cars/search`,
    filterOptions: `/api/cars/filter-options`,
    availability: {
        search: `/api/cars/availability/search`,
        calendar: (id: number) => `/api/cars/${id}/availability/calendar`,
        similar: (id: number) => `/api/cars/${id}/similar`,
    },
    admin: {
        list: `/api/cars`,
        create: `/api/cars`,
        byId: (id: number) => `/api/cars/${id}`,
        update: (id: number) => `/api/cars/${id}`,
        delete: (id: number) => `/api/cars/${id}`,
        updateStatus: (id: number) => `/api/cars/business/${id}/status`,
    },
} as const;