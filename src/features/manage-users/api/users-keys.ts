import type { AdminRentalStatus } from '@/entities/rental';

export interface UserFilters {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
}

export const usersKeys = {
    all: ['manage-users'] as const,
    list: (filters?: UserFilters) => [...usersKeys.all, 'list', filters] as const,
    detail: (id: number) => [...usersKeys.all, 'detail', id] as const,
    stats: () => [...usersKeys.all, 'stats'] as const,
    rentalHistory: (id: number, page: number, status?: AdminRentalStatus) =>
        [...usersKeys.all, 'rental-history', id, page, status] as const,
    notes: (id: number) => [...usersKeys.all, 'notes', id] as const,
};