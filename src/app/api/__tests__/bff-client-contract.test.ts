import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENDPOINTS } from '@/shared/api/endpoints';

const SRC = join(process.cwd(), 'src');
const API_DIR = join(SRC, 'app', 'api');
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const GUARD_FILES = new Set(['shared/config/route-access.ts', 'proxy.ts', 'app/setup-tests.ts']);

interface BffRoute {
    segments: string[];
    methods: Set<string>;
}

interface ClientCall {
    file: string;
    url: string;
    method?: string;
}

function walk(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (entry === 'generated' || entry === '__tests__' || entry === 'testing') continue;
            walk(full, found);
        } else {
            found.push(full);
        }
    }
    return found;
}

function sourceFiles(): Array<{ rel: string; source: string }> {
    return walk(SRC)
        .map((file) => ({ rel: relative(SRC, file).split(sep).join('/'), file }))
        .filter(({ rel }) => /\.(ts|tsx)$/.test(rel) && !rel.endsWith('.d.ts'))
        .map(({ rel, file }) => ({ rel, source: readFileSync(file, 'utf8') }));
}

function loadRoutes(): BffRoute[] {
    return walk(API_DIR)
        .filter((file) => file.endsWith(`${sep}route.ts`))
        .map((file) => {
            const dir = relative(API_DIR, file).split(sep).slice(0, -1);
            const source = readFileSync(file, 'utf8');
            const methods = new Set(
                METHODS.filter((method) =>
                    new RegExp(`export\\s+(?:const|async function|function)\\s+${method}\\b`).test(source)
                )
            );
            return { segments: ['api', ...dir], methods };
        });
}

function segmentsOf(url: string): string[] {
    return url
        .split('?')[0]
        .split('/')
        .filter(Boolean)
        .map((segment) => (segment.includes('${') ? '[dynamic]' : segment));
}

function matches(route: BffRoute, segments: string[]): boolean {
    if (route.segments.length !== segments.length) return false;
    return route.segments.every((segment, index) => {
        const wanted = segments[index];
        const dynamicRoute = segment.startsWith('[');
        if (wanted === '[dynamic]') return dynamicRoute;
        return dynamicRoute || segment === wanted;
    });
}

function endpointUrls(): Map<string, string> {
    const urls = new Map<string, string>();
    const visit = (node: unknown, path: string[]) => {
        if (typeof node === 'string') urls.set(path.join('.'), node);
        else if (typeof node === 'function') urls.set(path.join('.'), node('${id}', '${id}'));
        else if (node && typeof node === 'object') {
            for (const [key, value] of Object.entries(node)) visit(value, [...path, key]);
        }
    };
    visit(ENDPOINTS, []);
    return urls;
}

function clientCalls(): ClientCall[] {
    const calls: ClientCall[] = [];
    const urls = endpointUrls();
    for (const [key, url] of urls) {
        calls.push({ file: `shared/api/endpoints.ts#${key}`, url });
    }
    const usage = /client(Get|Post|Put|Patch|Delete)\b(?:<[^()]*>)?\(\s*(?:withQuery\(\s*)?ENDPOINTS\.([\w.]+)/g;
    for (const { rel, source } of sourceFiles()) {
        if (rel.startsWith('app/api/') || rel.startsWith('shared/server/')) continue;
        for (const match of source.matchAll(usage)) {
            const url = urls.get(match[2]);
            if (url) calls.push({ file: rel, url, method: match[1].toUpperCase() });
        }
    }
    const literal = /(['"`])(\/api\/(?:[^'"`$]|\$\{[^}]*\})*)\1/g;

    for (const { rel, source } of sourceFiles()) {
        if (rel.startsWith('app/api/') || rel.startsWith('shared/server/') || GUARD_FILES.has(rel)) continue;

        for (const match of source.matchAll(literal)) {
            const before = source.slice(Math.max(0, match.index - 90), match.index);
            const call = /client(Get|Post|Put|Patch|Delete)\b(?:<[^()]*>)?\(\s*$/.exec(before);
            calls.push({ file: rel, url: match[2], method: call ? call[1].toUpperCase() : undefined });
        }
    }

    return calls;
}

describe('browser calls map to BFF route handlers', () => {
    const routes = loadRoutes();
    const calls = clientCalls();

    it('finds BFF routes and client calls', () => {
        expect(routes.length).toBeGreaterThan(40);
        expect(calls.length).toBeGreaterThan(40);
    });

    it('has a route handler for every /api path used in client code', () => {
        const dead = calls
            .filter((call) => !routes.some((route) => matches(route, segmentsOf(call.url))))
            .map((call) => `${call.file}: ${call.url}`);

        expect(dead).toEqual([]);
    });

    it('exports the HTTP method the client uses', () => {
        const wrong = calls
            .filter((call) => call.method)
            .filter((call) => {
                const candidates = routes.filter((route) => matches(route, segmentsOf(call.url)));
                return candidates.length > 0 && !candidates.some((route) => route.methods.has(call.method as string));
            })
            .map((call) => `${call.file}: ${call.method} ${call.url}`);

        expect(wrong).toEqual([]);
    });

    it('never calls the API through a path that is not under /api', () => {
        const offenders: string[] = [];
        const apiClientCall =
            /apiClient\.(?:get|post|put|patch|delete)(?:<[^()]*>)?\(\s*(?!['"`]\/api\/|ENDPOINTS\.)([A-Za-z_.]+|['"`][^'"`]*['"`])/g;

        for (const { rel, source } of sourceFiles()) {
            if (rel.startsWith('app/api/') || rel.startsWith('shared/server/')) continue;
            for (const match of source.matchAll(apiClientCall)) {
                offenders.push(`${rel}: ${match[1]}`);
            }
        }

        expect(offenders).toEqual([]);
    });
});
