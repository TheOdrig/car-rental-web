export const DAMAGE_ENDPOINTS = {
    list: `/api/damages`,
    me: `/api/damages/me`,
    byId: (id: number) => `/api/damages/${id}`,
    assess: (id: number) => `/api/damages/${id}/assess`,
    resolve: (id: number) => `/api/damages/${id}/resolve`,
    dispute: (id: number) => `/api/damages/${id}/dispute`,
    photos: (id: number) => `/api/damages/${id}/photos`,
    byVehicle: (carId: number | string) => `/api/damages/vehicle/${carId}`,
    byCustomer: (userId: number | string) => `/api/damages/customer/${userId}`,
    statistics: `/api/damages/statistics`,
    admin: {
        list: `/api/admin/damages`,
        search: `/api/admin/damages/search`,
        byId: (id: number) => `/api/admin/damages/${id}`,
        assess: (id: number) => `/api/admin/damages/${id}/assess`,
        resolve: (id: number) => `/api/admin/damages/${id}/resolve`,
        photos: (id: number) => `/api/admin/damages/${id}/photos`,
        statistics: `/api/admin/damages/statistics`,
        byVehicle: (carId: number) => `/api/admin/damages/vehicle/${carId}`,
        byCustomer: (userId: number) => `/api/admin/damages/customer/${userId}`,
        deletePhoto: (id: number, photoId: number) => `/api/admin/damages/${id}/photos/${photoId}`,
    }
} as const;