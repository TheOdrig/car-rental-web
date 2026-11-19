import { describe, it, expect } from 'vitest';
import nextConfig, { buildContentSecurityPolicy, buildSecurityHeaders, FILE_ROUTE_CSP } from '../../next.config';

function valueOf(headers: Array<{ key: string; value: string }>, key: string): string | undefined {
    return headers.find((header) => header.key === key)?.value;
}

describe('security headers', () => {
    const production = buildSecurityHeaders({ isDevelopment: false, isProduction: true });

    function directive(csp: string, name: string): string[] {
        const entry = csp.split('; ').find((part) => part.startsWith(`${name} `));
        return entry ? entry.split(' ').slice(1) : [];
    }

    it('allows the Stripe.js and Link origins Stripe documents and nothing broader', () => {
        const csp = buildContentSecurityPolicy({ isDevelopment: false });

        expect(directive(csp, 'script-src')).toEqual([
            "'self'",
            "'unsafe-inline'",
            'https://js.stripe.com',
            'https://*.js.stripe.com',
        ]);
        expect(directive(csp, 'connect-src')).toEqual([
            "'self'",
            'https://api.stripe.com',
            'https://link.com',
            'https://*.link.com',
        ]);
        expect(directive(csp, 'frame-src')).toEqual([
            'https://js.stripe.com',
            'https://*.js.stripe.com',
            'https://hooks.stripe.com',
            'https://*.stripe.com',
            'https://m.stripe.network',
            'https://link.com',
            'https://*.link.com',
        ]);
        expect(csp).toContain("default-src 'self'");
    });

    it('forbids framing, plugins and foreign form targets', () => {
        const csp = buildContentSecurityPolicy({ isDevelopment: false });

        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("form-action 'self'");
        expect(csp).toContain("base-uri 'self'");
        expect(valueOf(production, 'X-Frame-Options')).toBe('DENY');
    });

    it('allows unsafe-eval and websockets only in development', () => {
        const development = buildContentSecurityPolicy({ isDevelopment: true });
        const prod = buildContentSecurityPolicy({ isDevelopment: false });

        expect(development).toContain("'unsafe-eval'");
        expect(development).toContain('ws:');
        expect(prod).not.toContain("'unsafe-eval'");
        expect(prod).not.toContain('ws:');
    });

    it('sends HSTS only in production', () => {
        expect(valueOf(production, 'Strict-Transport-Security')).toContain('max-age=');
        expect(valueOf(buildSecurityHeaders({ isDevelopment: true, isProduction: false }), 'Strict-Transport-Security')).toBeUndefined();
    });

    it('sets nosniff, referrer and permissions policies', () => {
        expect(valueOf(production, 'X-Content-Type-Options')).toBe('nosniff');
        expect(valueOf(production, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(valueOf(production, 'Permissions-Policy')).toContain('camera=()');
    });

    it('redirects the bare section roots to their landing pages', async () => {
        const rules = await nextConfig.redirects?.();

        expect(rules).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ source: '/settings', destination: '/settings/profile' }),
                expect.objectContaining({ source: '/dashboard', destination: '/rentals' }),
                expect.objectContaining({ source: '/admin', destination: '/admin/dashboard' }),
            ])
        );
    });

    it('does not advertise the framework', () => {
        expect(nextConfig.poweredByHeader).toBe(false);
    });

    it('applies the headers to every route through next.config', async () => {
        const rules = await nextConfig.headers?.();

        const global = rules?.find((rule) => rule.source !== '/api/files/:path*');
        const matches = (path: string) => new RegExp('^' + global!.source + '$').test(path);

        expect(global?.headers.map((header) => header.key)).toContain('Content-Security-Policy');
        expect(matches('/')).toBe(true);
        expect(matches('/api/cars')).toBe(true);
        expect(matches('/api/files/avatars/a.png')).toBe(false);
    });

    it('gives the file proxy its own sandboxing CSP instead of the site-wide one', async () => {
        const rules = await nextConfig.headers?.();
        const fileRule = rules?.find((rule) => rule.source === '/api/files/:path*');
        const csp = fileRule?.headers.filter((header) => header.key === 'Content-Security-Policy');

        expect(csp).toEqual([{ key: 'Content-Security-Policy', value: FILE_ROUTE_CSP }]);
        expect(fileRule?.headers.map((header) => header.key)).toContain('X-Content-Type-Options');
    });
});
