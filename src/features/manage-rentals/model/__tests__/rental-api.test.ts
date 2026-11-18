import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRentals, getRentalById, performRentalAction, cancelRental } from '@/features/manage-rentals';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api';
import {
    createMockRentalFilter,
    createMockPaginatedRentals,
    createMockRental,
    createMockRentalActionRequest,
} from '@/features/manage-rentals/__tests__/fixtures';
vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual('@/shared/api');
    return {
        ...actual,
        apiClient: {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        },
    };
});
describe('Rental API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('getRentals', () => {
        it('should fetch rentals with filter', async () => {
            const mockFilter = createMockRentalFilter();
            const mockResponse = createMockPaginatedRentals();
            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
            const result = await getRentals(mockFilter);
            expect(apiClient.get).toHaveBeenCalledWith('/api/rentals', {
                params: expect.any(Object),
            });
            expect(result).toEqual(mockResponse);
        });
        it('should fetch all rentals without filter', async () => {
            const mockResponse = createMockPaginatedRentals();
            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
            const result = await getRentals();
            expect(apiClient.get).toHaveBeenCalledWith('/api/rentals', {
                params: undefined,
            });
            expect(result).toEqual(mockResponse);
        });
    });
    describe('getRentalById', () => {
        it('should fetch rental by id', async () => {
            const mockRental = createMockRental();
            vi.mocked(apiClient.get).mockResolvedValue(mockRental);
            const result = await getRentalById(1);
            expect(apiClient.get).toHaveBeenCalledWith('/api/rentals/1');
            expect(result).toEqual(mockRental);
        });
        it('should handle rental not found', async () => {
            const error = new ApiError(404, 'Rental not found');
            vi.mocked(apiClient.get).mockRejectedValue(error);
            await expect(getRentalById(999)).rejects.toThrow('Rental not found');
        });
    });
    describe('performRentalAction', () => {
        it('should approve rental', async () => {
            const mockRequest = createMockRentalActionRequest({ action: 'approve' });
            const mockRental = createMockRental({ status: 'Confirmed' });
            vi.mocked(apiClient.post).mockResolvedValue(mockRental);
            const result = await performRentalAction(mockRequest);
            expect(apiClient.post).toHaveBeenCalledWith('/api/admin/rentals/1/approve', { notes: undefined, reason: undefined });
            expect(result.status).toBe('Confirmed');
        });
        it('should reject rental with reason', async () => {
            const mockRequest = createMockRentalActionRequest({ action: 'reject', reason: 'Invalid documents' });
            const mockRental = createMockRental({ status: 'Cancelled' });
            vi.mocked(apiClient.post).mockResolvedValue(mockRental);
            const result = await performRentalAction(mockRequest);
            expect(apiClient.post).toHaveBeenCalledWith('/api/admin/rentals/1/reject', { notes: undefined, reason: 'Invalid documents' });
            expect(result.status).toBe('Cancelled');
        });
        it('should handle unknown action', async () => {
            const mockRequest = { rentalId: 1, action: 'unknown' as never };
            await expect(performRentalAction(mockRequest)).rejects.toThrow('Unknown action: unknown');
        });
    });
    describe('cancelRental', () => {
        it('should cancel the rental through the BFF', async () => {
            const mockRental = createMockRental({ status: 'Cancelled' });
            vi.mocked(apiClient.delete).mockResolvedValue(mockRental);
            const result = await cancelRental(1);
            expect(apiClient.delete).toHaveBeenCalledWith('/api/rentals/1');
            expect(result.status).toBe('Cancelled');
        });
    });
});
