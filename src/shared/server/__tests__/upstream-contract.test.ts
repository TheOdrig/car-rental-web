import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import spec from '../../../../contract/openapi.json';
import { API, listUpstreamEndpoints } from '../upstream-endpoints';

type Operations = Record<string, Record<string, unknown>>;

const paths = (spec as unknown as { paths: Operations }).paths;
const SRC = join(process.cwd(), 'src');

function walk(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            walk(full, found);
        } else {
            found.push(full);
        }
    }
    return found;
}

function routeFiles(): string[] {
    return walk(join(SRC, 'app', 'api')).filter((file) => file.endsWith('route.ts'));
}

describe('upstream endpoint registry against the OpenAPI snapshot', () => {
    const endpoints = listUpstreamEndpoints();

    it('lists every registered endpoint', () => {
        expect(endpoints.length).toBeGreaterThan(50);
    });

    it.each(endpoints.map((endpoint) => [`${endpoint.method} ${endpoint.template}`, endpoint] as const))(
        '%s exists in the snapshot',
        (_label, endpoint) => {
            const operations = paths[endpoint.template];
            expect(operations, `path ${endpoint.template} is not in contract/openapi.json`).toBeDefined();
            expect(
                Object.keys(operations).map((method) => method.toUpperCase()),
                `${endpoint.method} is not defined on ${endpoint.template}`
            ).toContain(endpoint.method);
        }
    );

    it('does not register the removed POST /cars/search', () => {
        expect(
            endpoints.filter((endpoint) => endpoint.method === 'POST' && endpoint.template === '/api/v1/cars/search')
        ).toEqual([]);
        expect(Object.keys(paths['/api/v1/cars/search']).map((method) => method.toUpperCase())).toEqual(['GET']);
    });

    it('only targets /api/v1 paths', () => {
        expect(endpoints.every((endpoint) => endpoint.template.startsWith('/api/v1/'))).toBe(true);
    });

    it('resolves path parameters and encodes them', () => {
        expect(API.cars.byId.resolve({ id: 7 })).toEqual({ method: 'GET', path: '/api/v1/cars/7' });
        expect(API.oauth.authorize.resolve({ provider: 'a/b' }).path).toBe('/api/v1/oauth2/authorize/a%2Fb');
        expect(API.admin.damages.deletePhoto.resolve({ id: 3, photoId: 9 }).path).toBe(
            '/api/v1/admin/damages/3/photos/9'
        );
    });
});

describe('BFF route handlers', () => {
    it('never hard-code upstream paths', () => {
        const offenders = routeFiles()
            .filter((file) => /['"`]\/api\/v1\//.test(readFileSync(file, 'utf8')))
            .map((file) => relative(SRC, file));

        expect(offenders).toEqual([]);
    });

    it('only reference registered endpoints', () => {
        const known = new Set(listUpstreamEndpoints().map((endpoint) => endpoint.template));
        const missing: string[] = [];

        for (const file of routeFiles()) {
            const source = readFileSync(file, 'utf8');
            for (const match of source.matchAll(/\bAPI((?:\.\w+)+)\.resolve\(/g)) {
                const node = match[1]
                    .split('.')
                    .filter(Boolean)
                    .reduce<unknown>((current, key) => (current as Record<string, unknown> | undefined)?.[key], API);
                if (!node || !known.has((node as { template: string }).template)) {
                    missing.push(`${relative(SRC, file)}: API${match[1]}`);
                }
            }
        }

        expect(missing).toEqual([]);
    });
});
