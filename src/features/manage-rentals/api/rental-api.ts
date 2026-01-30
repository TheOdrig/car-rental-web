import { apiClient } from '@/shared/api';
import type { Rental } from '@/entities/rental';
import type { RentalFilter, RentalActionRequest, PaginatedRentals } from '../model/types';
import { RENTAL_ENDPOINTS } from './endpoints';

export async function getRentals(filter?: RentalFilter): Promise<PaginatedRentals> {
    return apiClient.get<PaginatedRentals>(RENTAL_ENDPOINTS.GET_RENTALS, {
        params: filter as unknown as Record<string, string | number | boolean>,
    });
}

export async function getRentalById(id: number): Promise<Rental> {
    return apiClient.get<Rental>(RENTAL_ENDPOINTS.GET_RENTAL(id));
}

export async function performRentalAction(request: RentalActionRequest): Promise<Rental> {
    const { rentalId, action, notes, reason } = request;

    let endpoint: string;
    switch (action) {
        case 'approve':
            endpoint = RENTAL_ENDPOINTS.APPROVE(rentalId);
            break;
        case 'reject':
            endpoint = RENTAL_ENDPOINTS.REJECT(rentalId);
            break;
        case 'pickup':
            endpoint = RENTAL_ENDPOINTS.PICKUP(rentalId);
            break;
        case 'return':
            endpoint = RENTAL_ENDPOINTS.RETURN(rentalId);
            break;
        case 'cancel':
            endpoint = RENTAL_ENDPOINTS.CANCEL(rentalId);
            break;
        default:
            throw new Error(`Unknown action: ${action}`);
    }

    return apiClient.post<Rental>(endpoint, { notes, reason });
}

export async function cancelRental(rentalId: number, reason?: string): Promise<Rental> {
    return performRentalAction({ rentalId, action: 'cancel', reason });
}

export async function updateRental(rentalId: number, data: Partial<Rental>): Promise<Rental> {
    return apiClient.put<Rental>(RENTAL_ENDPOINTS.GET_RENTAL(rentalId), data);
}
