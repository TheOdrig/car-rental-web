import { apiClient } from '@/shared/api';
import type { CreateBookingRequest, BookingConfirmation } from '../model/types';

export async function createBooking(request: CreateBookingRequest): Promise<BookingConfirmation> {
    return apiClient.post<BookingConfirmation>('/api/rentals', request);
}
