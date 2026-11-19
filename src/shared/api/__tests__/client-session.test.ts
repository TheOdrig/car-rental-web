import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientGet, clientPost, onSessionExpired, ApiError } from '@/shared/api';

function respond(status: number, body: unknown = {}): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: String(status),
        headers: { get: () => 'application/json' } as unknown as Headers,
        json: async () => body,
    } as unknown as Response;
}

function calledPaths(): string[] {
    return vi.mocked(fetch).mock.calls.map(([url]) => new URL(String(url), 'http://localhost').pathname);
}

describe('client session handling', () => {
    const expired = vi.fn();

    beforeEach(() => {
        global.fetch = vi.fn();
        expired.mockClear();
        onSessionExpired(expired);
    });

    afterEach(() => {
        onSessionExpired(null);
    });

    it('never tries to refresh when /api/auth/me answers 401', async () => {
        vi.mocked(fetch).mockResolvedValue(respond(401, { message: 'Not authenticated' }));

        await expect(clientGet('/api/auth/me')).rejects.toBeInstanceOf(ApiError);

        expect(calledPaths()).toEqual(['/api/auth/me']);
        expect(expired).not.toHaveBeenCalled();
    });

    it('refreshes once on a 401 and retries the original call', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(respond(401))
            .mockResolvedValueOnce(respond(200))
            .mockResolvedValueOnce(respond(200, { data: 1 }));

        await expect(clientGet('/api/rentals/me')).resolves.toEqual({ data: 1 });

        expect(calledPaths()).toEqual(['/api/rentals/me', '/api/auth/refresh', '/api/rentals/me']);
        expect(expired).not.toHaveBeenCalled();
    });

    it('reports an expired session when the refresh fails', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(respond(401, { message: 'expired' }))
            .mockResolvedValueOnce(respond(401));

        await expect(clientGet('/api/rentals/me')).rejects.toBeInstanceOf(ApiError);

        expect(calledPaths()).toEqual(['/api/rentals/me', '/api/auth/refresh']);
        expect(expired).toHaveBeenCalledTimes(1);
    });

    it('reports an expired session when the retry after a refresh is still 401', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(respond(401))
            .mockResolvedValueOnce(respond(200))
            .mockResolvedValueOnce(respond(401));

        await expect(clientGet('/api/rentals/me')).rejects.toBeInstanceOf(ApiError);

        expect(expired).toHaveBeenCalledTimes(1);
    });

    it('does not treat a wrong password as an expired session', async () => {
        vi.mocked(fetch).mockResolvedValue(respond(401, { message: 'Bad credentials' }));

        await expect(clientPost('/api/auth/login', { username: 'a', password: 'b' })).rejects.toBeInstanceOf(ApiError);

        expect(calledPaths()).toEqual(['/api/auth/login']);
        expect(expired).not.toHaveBeenCalled();
    });

    it('does not report anything for other client errors', async () => {
        vi.mocked(fetch).mockResolvedValue(respond(403));

        await expect(clientGet('/api/rentals/me')).rejects.toBeInstanceOf(ApiError);

        expect(calledPaths()).toEqual(['/api/rentals/me']);
        expect(expired).not.toHaveBeenCalled();
    });
});
