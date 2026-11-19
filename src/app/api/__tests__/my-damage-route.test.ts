import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const jar = new Map<string, string>();

vi.mock('next/headers', () => ({
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
import { GET as getMyDamage } from '../damages/[id]/route';

const fetchMock = vi.fn();

function ctx(id: string) {
    return { params: Promise.resolve({ id }) };
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('customer damage detail BFF route', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'a1');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('reads the owner-only damage endpoint', async () => {
        fetchMock.mockResolvedValueOnce(json({ id: 7, photos: [] }));

        const response = await getMyDamage(new NextRequest('http://localhost:3000/api/damages/7'), ctx('7'));

        expect(response.status).toBe(200);
        expect(String(fetchMock.mock.calls[0][0])).toBe('http://localhost:8082/api/v1/damages/7');
    });

    it('passes the owner-only 404 through and rejects a malformed id', async () => {
        fetchMock.mockResolvedValueOnce(json({ status: 404, detail: 'Not found' }, 404));

        expect((await getMyDamage(new NextRequest('http://localhost:3000/api/damages/8'), ctx('8'))).status).toBe(404);
        expect((await getMyDamage(new NextRequest('http://localhost:3000/api/damages/x'), ctx('x'))).status).toBe(400);
    });
});
