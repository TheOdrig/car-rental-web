import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from '@/shared/api';

global.fetch = vi.fn();

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET request', () => {
        it('should perform GET request correctly', async () => {
            const mockData = { id: 1, name: 'Test' };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' } as unknown as Headers,
                json: async () => mockData,
            } as unknown as Response);

            const result = await apiClient.get('/test');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({ method: 'GET' })
            );
            expect(result).toEqual(mockData);
        });

        it('should throw ApiError on failure', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: { get: () => 'application/json' } as unknown as Headers,
                json: async () => ({ message: 'Not Found' }),
            } as unknown as Response);

            await expect(apiClient.get('/not-found')).rejects.toThrow(ApiError);
        });

        it('should handle query params', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' } as unknown as Headers,
                json: async () => ({}),
            } as unknown as Response);

            await apiClient.get('/search', { params: { q: 'car', limit: 10 } });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('q=car'),
                expect.objectContaining({})
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('limit=10'),
                expect.objectContaining({})
            );
        });
    });

    describe('POST request', () => {
        it('should send body correctly', async () => {
            const mockData = { success: true };
            const body = { name: 'New Car' };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' } as unknown as Headers,
                json: async () => mockData,
            } as unknown as Response);

            const result = await apiClient.post('/create', body);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(body),
                })
            );
            expect(result).toEqual(mockData);
        });
    });
});
