import { describe, it, expect, vi, beforeEach } from 'vitest';

const get = vi.hoisted(() => vi.fn());

vi.mock('@/shared/server', () => ({
    API: { cars: { list: { resolve: () => ({ method: 'GET', path: '/api/v1/cars' }) } } },
    upstream: { get },
}));

import sitemap from '../sitemap';

describe('sitemap', () => {
    beforeEach(() => {
        get.mockReset();
    });

    it('lists the public pages and every car the API returns', async () => {
        get.mockResolvedValue({ content: [{ id: 4 }, { id: 9 }, {}] });

        const entries = await sitemap();
        const urls = entries.map((entry) => entry.url);

        expect(urls).toContain('http://localhost:3000/cars');
        expect(urls).toContain('http://localhost:3000/cars/4');
        expect(urls).toContain('http://localhost:3000/cars/9');
        expect(urls.some((url) => url.includes('/admin') || url.includes('/login'))).toBe(false);
    });

    it('still serves the static pages when the API is down', async () => {
        get.mockImplementation(() => {
            throw new Error('down');
        });

        const urls = (await sitemap()).map((entry) => entry.url);

        expect(urls).toEqual(expect.arrayContaining(['http://localhost:3000', 'http://localhost:3000/terms']));
        expect(urls.some((url) => /\/cars\/\d+/.test(url))).toBe(false);
    });
});
