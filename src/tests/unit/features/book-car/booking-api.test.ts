import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBooking, getAvailableCars, getBooking, cancelBooking } from '@/features/book-car/api/booking-api';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api/error';
import {
    createMockBookingRequest,
    createMockBooking,
    createMockAvailabilityFilters,
    createMockAvailableCar,
} from './fixtures';

vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual('@/shared/api');
    return {
        ...actual,
        apiClient: {
            get: vi.fn(),
            post: vi.fn(),
        },
    };
});

describe('Booking API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createBooking', () => {
        it('should create booking with valid request', async () => {
            const mockRequest = createMockBookingRequest();
            const mockResponse = createMockBooking();

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await createBooking(mockRequest);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals', mockRequest);
            expect(result).toEqual(mockResponse);
        });

        it('should handle unavailable car error', async () => {
            const mockRequest = createMockBookingRequest();
            const error = new ApiError(400, 'Car not available for selected dates');

            (apiClient.post as any).mockRejectedValue(error);

            await expect(createBooking(mockRequest)).rejects.toThrow('Car not available for selected dates');
        });

        it('should handle authentication error', async () => {
            const mockRequest = createMockBookingRequest();
            const error = new ApiError(401, 'Unauthorized');

            (apiClient.post as any).mockRejectedValue(error);

            await expect(createBooking(mockRequest)).rejects.toThrow('Unauthorized');
        });
    });

    describe('getAvailableCars', () => {
        it('should fetch available cars with filters', async () => {
            const mockFilters = createMockAvailabilityFilters();
            const mockCars = [createMockAvailableCar(), createMockAvailableCar({ id: 2, brand: 'Honda' })];

            (apiClient.get as any).mockResolvedValue(mockCars);

            const result = await getAvailableCars(mockFilters);

            expect(apiClient.get).toHaveBeenCalledWith('/cars/available', {
                params: expect.any(Object),
            });
            expect(result).toEqual(mockCars);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no cars available', async () => {
            const mockFilters = createMockAvailabilityFilters();

            (apiClient.get as any).mockResolvedValue([]);

            const result = await getAvailableCars(mockFilters);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle API error', async () => {
            const mockFilters = createMockAvailabilityFilters();
            const error = new ApiError(500, 'Internal server error');

            (apiClient.get as any).mockRejectedValue(error);

            await expect(getAvailableCars(mockFilters)).rejects.toThrow('Internal server error');
        });
    });

    describe('getBooking', () => {
        it('should fetch booking by id', async () => {
            const mockBooking = createMockBooking();

            (apiClient.get as any).mockResolvedValue(mockBooking);

            const result = await getBooking(1);

            expect(apiClient.get).toHaveBeenCalledWith('/rentals/1');
            expect(result).toEqual(mockBooking);
        });

        it('should handle booking not found', async () => {
            const error = new ApiError(404, 'Booking not found');

            (apiClient.get as any).mockRejectedValue(error);

            await expect(getBooking(999)).rejects.toThrow('Booking not found');
        });
    });

    describe('cancelBooking', () => {
        it('should cancel booking successfully', async () => {
            (apiClient.post as any).mockResolvedValue(undefined);

            await cancelBooking(1);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals/1/cancel', {});
        });

        it('should handle cancellation error', async () => {
            const error = new ApiError(400, 'Cannot cancel confirmed booking');

            (apiClient.post as any).mockRejectedValue(error);

            await expect(cancelBooking(1)).rejects.toThrow('Cannot cancel confirmed booking');
        });
    });
});
