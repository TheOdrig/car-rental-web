const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

export const endpoints = {
    auth: {
        login: `${API_BASE_URL}/api/auth/login`,
        register: `${API_BASE_URL}/api/auth/register`,
        refresh: `${API_BASE_URL}/api/auth/refresh`,
        oauth: {
            authorize: (provider: string) => `${API_BASE_URL}/api/oauth2/authorize/${provider}`,
            callback: (provider: string) => `${API_BASE_URL}/api/oauth2/callback/${provider}`,
            link: (provider: string) => `${API_BASE_URL}/api/oauth2/link/${provider}`,
        },
    },
    cars: {
        list: `${API_BASE_URL}/api/cars`,
        active: `${API_BASE_URL}/api/cars`,
        featured: `${API_BASE_URL}/api/cars/featured`,
        byId: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
        byLicensePlate: (plate: string) => `${API_BASE_URL}/api/cars/licensePlate/${plate}`,
        search: `${API_BASE_URL}/api/cars/search`,
        availability: {
            search: `${API_BASE_URL}/api/cars/availability/search`,
            calendar: (id: number) => `${API_BASE_URL}/api/cars/${id}/availability/calendar`,
            similar: (id: number) => `${API_BASE_URL}/api/cars/${id}/similar`,
        },
    },
    rentals: {
        list: `${API_BASE_URL}/api/rentals/admin`,
        me: `${API_BASE_URL}/api/rentals/me`,
        byId: (id: number) => `${API_BASE_URL}/api/rentals/${id}`,
        request: `${API_BASE_URL}/api/rentals/request`,
        confirm: (id: number) => `${API_BASE_URL}/api/rentals/${id}/confirm`,
        cancel: (id: number) => `${API_BASE_URL}/api/rentals/${id}/cancel`,
        pickup: (id: number) => `${API_BASE_URL}/api/rentals/${id}/pickup`,
        return: (id: number) => `${API_BASE_URL}/api/rentals/${id}/return`,
    },
    pricing: {
        calculate: `${API_BASE_URL}/api/pricing/calculate`,
        preview: `${API_BASE_URL}/api/pricing/preview`,
        strategies: `${API_BASE_URL}/api/pricing/strategies`,
    },
    admin: {
        dashboard: {
            summary: `${API_BASE_URL}/api/admin/dashboard/summary`,
            fleet: `${API_BASE_URL}/api/admin/dashboard/fleet`,
            metrics: `${API_BASE_URL}/api/admin/dashboard/metrics`,
            revenue: `${API_BASE_URL}/api/admin/dashboard/revenue`,
            pending: {
                approvals: `${API_BASE_URL}/api/admin/dashboard/pending/approvals`,
                pickups: `${API_BASE_URL}/api/admin/dashboard/pending/pickups`,
                returns: `${API_BASE_URL}/api/admin/dashboard/pending/returns`,
                overdue: `${API_BASE_URL}/api/admin/dashboard/pending/overdue`,
            },
        },
        alerts: `${API_BASE_URL}/api/admin/alerts`,
        acknowledgeAlert: (id: number) => `${API_BASE_URL}/api/admin/alerts/${id}/acknowledge`,
        quickActions: {
            approve: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/approve`,
            pickup: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/pickup`,
            return: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/return`,
        },
        lateReturns: `${API_BASE_URL}/api/admin/late-returns`,
        lateReturnStatistics: `${API_BASE_URL}/api/admin/late-returns/statistics`,
        penaltyWaive: (id: number) => `${API_BASE_URL}/api/admin/rentals/${id}/penalty/waive`,
        penaltyHistory: (id: number) => `${API_BASE_URL}/api/admin/rentals/${id}/penalty/history`,
        cars: {
            list: `${API_BASE_URL}/api/admin/cars`,
            create: `${API_BASE_URL}/api/admin/cars`,
            byId: (id: number) => `${API_BASE_URL}/api/admin/cars/${id}`,
            update: (id: number) => `${API_BASE_URL}/api/admin/cars/${id}`,
            delete: (id: number) => `${API_BASE_URL}/api/admin/cars/${id}`,
            updateStatus: (id: number) => `${API_BASE_URL}/api/admin/cars/${id}/status`,
        },
        users: {
            list: `${API_BASE_URL}/api/admin/users`,
            byId: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
            updateRole: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/role`,
            ban: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/ban`,
            unban: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/unban`,
        },
    },
    damages: {
        me: `${API_BASE_URL}/api/damages/me`,
        photoUrl: (photoId: number) => `${API_BASE_URL}/api/damages/photos/${photoId}/url`,
        admin: {
            create: `${API_BASE_URL}/api/admin/damages`,
            byId: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}`,
            assess: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/assess`,
            photos: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/photos`,
            deletePhoto: (id: number, photoId: number) => `${API_BASE_URL}/api/admin/damages/${id}/photos/${photoId}`,
            resolve: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/resolve`,
            search: `${API_BASE_URL}/api/admin/damages/search`,
            statistics: `${API_BASE_URL}/api/admin/damages/statistics`,
            vehicleHistory: (carId: number) => `${API_BASE_URL}/api/admin/damages/vehicle/${carId}`,
            customerHistory: (userId: number) => `${API_BASE_URL}/api/admin/damages/customer/${userId}`,
        },
        dispute: (id: number) => `${API_BASE_URL}/api/damages/${id}/dispute`,
    },
    currency: {
        rates: `${API_BASE_URL}/api/exchange-rates`,
        rate: (from: string, to: string) => `${API_BASE_URL}/api/exchange-rates/${from}/${to}`,
        convert: `${API_BASE_URL}/api/exchange-rates/convert`,
        refresh: `${API_BASE_URL}/api/exchange-rates/refresh`,
    },
} as const;

export { API_BASE_URL };
