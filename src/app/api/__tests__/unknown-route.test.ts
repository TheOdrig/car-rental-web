import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../[...path]/route';

const context = { params: Promise.resolve({ path: ['nope'] }) };

describe('unknown BFF routes', () => {
    it('answer with a problem body instead of an HTML page', async () => {
        const response = await GET(new NextRequest('http://localhost:3000/api/nope'), context);

        expect(response.status).toBe(404);
        expect(response.headers.get('content-type')).toContain('application/problem+json');
        expect(await response.json()).toMatchObject({ status: 404, title: 'Not Found', code: 'NOT_FOUND' });
    });

    it('keep the origin guard on state-changing methods', async () => {
        const response = await POST(
            new NextRequest('http://localhost:3000/api/nope', {
                method: 'POST',
                headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
                body: '{}',
            }),
            context
        );

        expect(response.status).toBe(403);
    });
});
