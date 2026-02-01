const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const DAMAGE_ENDPOINTS = {
    list: `${API_BASE_URL}/api/damages`,
    me: `${API_BASE_URL}/api/damages/me`,
    byId: (id: number) => `${API_BASE_URL}/api/damages/${id}`,
    assess: (id: number) => `${API_BASE_URL}/api/damages/${id}/assess`,
    resolve: (id: number) => `${API_BASE_URL}/api/damages/${id}/resolve`,
    dispute: (id: number) => `${API_BASE_URL}/api/damages/${id}/dispute`,
    photos: (id: number) => `${API_BASE_URL}/api/damages/${id}/photos`,
    byVehicle: (carId: number | string) => `${API_BASE_URL}/api/damages/vehicle/${carId}`,
    byCustomer: (userId: number | string) => `${API_BASE_URL}/api/damages/customer/${userId}`,
    statistics: `${API_BASE_URL}/api/damages/statistics`,
    admin: {
        list: `${API_BASE_URL}/api/admin/damages`,
        search: `${API_BASE_URL}/api/admin/damages/search`,
        byId: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}`,
        assess: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/assess`,
        resolve: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/resolve`,
        photos: (id: number) => `${API_BASE_URL}/api/admin/damages/${id}/photos`,
        statistics: `${API_BASE_URL}/api/admin/damages/statistics`,
        byVehicle: (carId: number) => `${API_BASE_URL}/api/admin/damages/vehicle/${carId}`,
        byCustomer: (userId: number) => `${API_BASE_URL}/api/admin/damages/customer/${userId}`,
        deletePhoto: (id: number, photoId: number) => `${API_BASE_URL}/api/admin/damages/${id}/photos/${photoId}`,
    }
} as const;