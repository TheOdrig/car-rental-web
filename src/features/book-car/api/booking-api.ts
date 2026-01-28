import { apiClient } from '@/shared/api';
import type { BookingRequest, Booking, AvailabilityFilters, AvailableCar } from '../model/types';
import { BOOKING_ENDPOINTS } from './endpoints';

export async function createBooking(request: BookingRequest): Promise<Booking> {
    return apiClient.post<Booking>(BOOKING_ENDPOINTS.CREATE, request);
}

export async function getAvailableCars(filters: AvailabilityFilters): Promise<AvailableCar[]> {
    return apiClient.get<AvailableCar[]>(BOOKING_ENDPOINTS.GET_AVAILABLE_CARS, {
        params: filters as unknown as Record<string, string | number | boolean>,
    });
}

export async function getBooking(id: number): Promise<Booking> {
    return apiClient.get<Booking>(BOOKING_ENDPOINTS.GET_BOOKING(id));
}

export async function cancelBooking(id: number): Promise<void> {
    return apiClient.post<void>(BOOKING_ENDPOINTS.CANCEL_BOOKING(id), {});
}
