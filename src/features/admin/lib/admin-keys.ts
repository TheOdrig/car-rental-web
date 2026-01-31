export interface PendingFilters {
    page?: number;
    size?: number;
}

export interface AdminCarsFilters {
    page?: number;
    size?: number;
    status?: string;
    brand?: string;
    search?: string;
}

export const adminKeys = {
    all: ['admin'] as const,
    dashboard: () => [...adminKeys.all, 'dashboard'] as const,
    summary: () => [...adminKeys.dashboard(), 'summary'] as const,
    fleet: () => [...adminKeys.dashboard(), 'fleet'] as const,
    pending: () => [...adminKeys.dashboard(), 'pending'] as const,
    pendingApprovals: (filters?: PendingFilters) => [...adminKeys.pending(), 'approvals', filters] as const,
    pendingPickups: (filters?: PendingFilters) => [...adminKeys.pending(), 'pickups', filters] as const,
    pendingReturns: (filters?: PendingFilters) => [...adminKeys.pending(), 'returns', filters] as const,
    overdueRentals: (filters?: PendingFilters) => [...adminKeys.pending(), 'overdue', filters] as const,
    revenue: () => [...adminKeys.all, 'revenue'] as const,
    alerts: () => [...adminKeys.all, 'alerts'] as const,
    cars: () => [...adminKeys.all, 'cars'] as const,
    carsList: (filters?: AdminCarsFilters) => [...adminKeys.cars(), 'list', filters] as const,
    rentals: () => [...adminKeys.all, 'rentals'] as const,
    rentalDetail: (id: number) => [...adminKeys.rentals(), id] as const,
    vehicleDetail: (id: number) => [...adminKeys.cars(), id] as const,
    vehicleRentalHistory: (id: number, page: number) => [...adminKeys.cars(), id, 'rentals', page] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    customerDetail: (id: number) => [...adminKeys.users(), id] as const,
    customerRentalHistory: (id: number, page: number, status?: string) => [...adminKeys.users(), id, 'rentals', page, status] as const,
    customerNotes: (id: number) => [...adminKeys.users(), id, 'notes'] as const,
};
