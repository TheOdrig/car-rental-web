import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBooking } from '@/features/book-car';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api';
import {
    createMockBookingRequest,
    createMockBooking,
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

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await createBooking(mockRequest);

            expect(apiClient.post).toHaveBeenCalledWith('/rentals', mockRequest);
            expect(result).toEqual(mockResponse);
        });

        it('should handle unavailable car error', async () => {
            const mockRequest = createMockBookingRequest();
            const error = new ApiError(400, 'Car not available for selected dates');

            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(createBooking(mockRequest)).rejects.toThrow('Car not available for selected dates');
        });

        it('should handle authentication error', async () => {
            const mockRequest = createMockBookingRequest();
            const error = new ApiError(401, 'Unauthorized');

            vi.mocked(apiClient.post).mockRejectedValue(error);

            await expect(createBooking(mockRequest)).rejects.toThrow('Unauthorized');
        });
    });

    describe.skip('getAvailableCars', () => {
        it('should fetch available cars with filters', async () => {
        });
    });

    describe.skip('getBooking', () => {
        it('should fetch booking by id', async () => {
        });
    });

    describe.skip('cancelBooking', () => {
        it('should cancel booking successfully', async () => {
        });
    });
});
