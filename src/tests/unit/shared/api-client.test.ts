import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';

global.fetch = vi.fn();

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET request', () => {
        it('should perform GET request correctly', async () => {
            const mockData = { id: 1, name: 'Test' };
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: async () => mockData,
            });

            const result = await apiClient.get('/test');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({ method: 'GET' })
            );
            expect(result).toEqual(mockData);
        });

        it('should throw ApiError on failure', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: { get: () => 'application/json' },
                json: async () => ({ message: 'Not Found' }),
            });

            await expect(apiClient.get('/not-found')).rejects.toThrow(ApiError);
        });

        it('should handle query params', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: async () => ({}),
            });

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

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: async () => mockData,
            });

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
