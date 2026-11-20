import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const jar = new Map<string, string>();

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers()),
    cookies: vi.fn(async () => ({
        get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
        set: (name: string, value: string) => {
            jar.set(name, value);
        },
        delete: (name: string) => {
            jar.delete(name);
        },
    })),
}));

import { resetServerEnvForTests } from '@/shared/server/env';
import { resetRefreshCacheForTests } from '@/shared/server/upstream';
import { GET } from '../files/[directory]/[filename]/route';

const fetchMock = vi.fn();

function call(path: string[]) {
    const [directory, filename] = path;
    return GET(new NextRequest(`http://localhost:3000/api/files/${path.join('/')}`), {
        params: Promise.resolve({ directory, filename }),
    });
}

describe('GET /api/files/[directory]/[filename]', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'tok');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('streams the file with the caller token and a private cache policy', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'Content-Type': 'image/png' } })
        );

        const response = await call(['avatars', 'a.png']);

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/png');
        expect(response.headers.get('cache-control')).toBe('private, max-age=300');
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
        const [url, init] = fetchMock.mock.calls[0];
        expect((url as URL).pathname).toBe('/api/v1/files/avatars/a.png');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    });

    it('passes an upstream 404 through', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'gone' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await call(['avatars', 'missing.png']);

        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        const body = await response.json();
        expect(body.code).toBe('FILE_NOT_FOUND');
        expect(body.detail ?? body.message).toBe('The file does not exist');
    });

    it('answers FILE_NOT_FOUND from the API as a quiet 404', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: 'FILE_NOT_FOUND', message: 'File missing.png was not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await call(['damage-photos', 'missing.png']);

        expect(response.status).toBe(404);
        expect((await response.json()).code).toBe('FILE_NOT_FOUND');
    });

    it('rejects unknown directories without calling the API', async () => {
        const response = await call(['secrets', 'a.png']);

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects path traversal without calling the API', async () => {
        const response = await call(['avatars', '..']);

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
