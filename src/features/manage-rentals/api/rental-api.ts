import { apiClient } from '@/shared/api';
import type { Rental } from '@/entities/rental';
import type { RentalFilter, RentalActionRequest, PaginatedRentals } from '../model/types';

function filterToParams(filter?: RentalFilter): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};

    if (filter?.status !== undefined) params.status = filter.status;
    if (filter?.startDate !== undefined) params.startDate = filter.startDate;
    if (filter?.endDate !== undefined) params.endDate = filter.endDate;
    if (filter?.carId !== undefined) params.carId = filter.carId;
    if (filter?.userId !== undefined) params.userId = filter.userId;

    return params;
}

export async function getRentals(filter?: RentalFilter): Promise<PaginatedRentals> {
    return apiClient.get<PaginatedRentals>('/api/rentals', { params: filterToParams(filter) });
}

export async function getRentalById(id: number): Promise<Rental> {
    return apiClient.get<Rental>(`/api/rentals/${id}`);
}

export async function performRentalAction(request: RentalActionRequest): Promise<Rental> {
    const { rentalId, action, notes, reason } = request;

    const body = { notes, reason };

    switch (action) {
        case 'approve':
            return apiClient.post<Rental>(`/api/admin/rentals/${rentalId}/approve`, body);
        case 'reject':
            return apiClient.post<Rental>(`/api/admin/rentals/${rentalId}/reject`, body);
        case 'pickup':
            return apiClient.post<Rental>(`/api/admin/rentals/${rentalId}/pickup`, body);
        case 'return':
            return apiClient.post<Rental>(`/api/admin/rentals/${rentalId}/return`, body);
        case 'cancel':
            return apiClient.delete<Rental>(`/api/rentals/${rentalId}`);
        default:
            throw new Error(`Unknown action: ${action}`);
    }
}

export async function cancelRental(rentalId: number): Promise<Rental> {
    return performRentalAction({ rentalId, action: 'cancel' });
}
