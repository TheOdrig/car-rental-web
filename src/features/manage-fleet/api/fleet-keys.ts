export interface FleetFilters {
    status?: string;
    brand?: string;
    occupancy?: string;
    search?: string;
    page?: number;
    size?: number;
}

export const fleetKeys = {
    all: ['fleet'] as const,
    list: (filters?: FleetFilters) => [...fleetKeys.all, 'list', filters] as const,
    detail: (id: number) => [...fleetKeys.all, 'detail', id] as const,
    vehicleDetail: (id: number) => [...fleetKeys.all, 'vehicle-detail', id] as const,
    vehicleRentalHistory: (id: number, page: number) => [...fleetKeys.all, 'vehicle-rental-history', id, page] as const,
};