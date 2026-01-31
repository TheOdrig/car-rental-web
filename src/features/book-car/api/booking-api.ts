import { apiClient } from '@/shared/api';
import type { CreateBookingRequest, BookingConfirmation } from '../model/types';
import { BOOKING_ENDPOINTS } from './endpoints';

export async function createBooking(request: CreateBookingRequest): Promise<BookingConfirmation> {
    return apiClient.post<BookingConfirmation>(BOOKING_ENDPOINTS.CREATE, request);
}