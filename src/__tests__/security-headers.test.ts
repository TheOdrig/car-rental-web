import { describe, it, expect } from 'vitest';
import nextConfig, { buildContentSecurityPolicy, buildSecurityHeaders } from '../../next.config';

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
            'https://maps.googleapis.com',
        ]);
        expect(directive(csp, 'connect-src')).toEqual([
            "'self'",
            'https://api.stripe.com',
            'https://maps.googleapis.com',
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

    it('applies the headers to every route through next.config', async () => {
        const rules = await nextConfig.headers?.();

        expect(rules).toHaveLength(1);
        expect(rules?.[0].source).toBe('/:path*');
        expect(rules?.[0].headers.map((header) => header.key)).toContain('Content-Security-Policy');
    });
});
