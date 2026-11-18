import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/api', () => ({
    apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import { apiClient } from '@/shared/api';
import { RentalStatus } from '@/entities/rental';
import { getRentals } from '../rental-api';

describe('getRentals', () => {
    beforeEach(() => {
        vi.mocked(apiClient.get).mockReset();
        vi.mocked(apiClient.get).mockResolvedValue({ content: [] });
    });

    it('sends only the filters that are set', async () => {
        await getRentals({ status: RentalStatus.CONFIRMED, carId: 4 });

        expect(apiClient.get).toHaveBeenCalledWith('/api/rentals', { params: { status: 'Confirmed', carId: 4 } });
    });

    it('sends no params without a filter', async () => {
        await getRentals();

        expect(apiClient.get).toHaveBeenCalledWith('/api/rentals', { params: {} });
    });
});
