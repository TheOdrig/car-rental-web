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
import { POST } from '../users/me/password/route';

const fetchMock = vi.fn();

function change() {
    return POST(
        new NextRequest('http://localhost:3000/api/users/me/password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ currentPassword: 'old-pass-1', newPassword: 'old-pass-1' }),
        }),
        { params: Promise.resolve({}) }
    );
}

describe('POST /api/users/me/password', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'tok');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('keeps the API message and code for a new password equal to the current one', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    code: 'INVALID_PASSWORD',
                    message: 'New password must be different from current password',
                    instance: '/api/v1/users/me/password',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        );

        const response = await change();
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.code).toBe('INVALID_PASSWORD');
        expect(body.detail).toBe('New password must be different from current password');
    });
});
