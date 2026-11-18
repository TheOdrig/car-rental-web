import { describe, it, expect } from 'vitest';
import { resolveClientIp } from '../client-ip';

function headers(values: Record<string, string>): Headers {
    return new Headers(values);
}

describe('resolveClientIp', () => {
    it('returns nothing with zero hops even when forwarded headers are present', () => {
        const source = headers({ 'x-forwarded-for': '203.0.113.9', 'x-real-ip': '203.0.113.10' });
        expect(resolveClientIp(source, { trustedProxyHops: 0 })).toBeUndefined();
    });

    it('takes the right-most hop for one trusted proxy and ignores spoofed left entries', () => {
        const source = headers({ 'x-forwarded-for': '1.1.1.1, 198.51.100.7' });
        expect(resolveClientIp(source, { trustedProxyHops: 1 })).toBe('198.51.100.7');
    });

    it('counts hops from the right for two trusted proxies', () => {
        const source = headers({ 'x-forwarded-for': '1.1.1.1, 198.51.100.7, 10.0.0.2' });
        expect(resolveClientIp(source, { trustedProxyHops: 2 })).toBe('198.51.100.7');
    });

    it('returns nothing when there are fewer entries than hops', () => {
        expect(resolveClientIp(headers({ 'x-forwarded-for': '198.51.100.7' }), { trustedProxyHops: 2 })).toBeUndefined();
        expect(resolveClientIp(headers({}), { trustedProxyHops: 1 })).toBeUndefined();
    });

    it('rejects entries that are not IP literals', () => {
        expect(resolveClientIp(headers({ 'x-forwarded-for': 'unknown' }), { trustedProxyHops: 1 })).toBeUndefined();
        expect(resolveClientIp(headers({ 'x-forwarded-for': '999.1.1.1' }), { trustedProxyHops: 1 })).toBeUndefined();
    });

    it('accepts IPv6 and lowercases it', () => {
        expect(resolveClientIp(headers({ 'x-forwarded-for': '2001:DB8::1' }), { trustedProxyHops: 1 })).toBe('2001:db8::1');
    });

    it('uses an explicitly trusted header before the hop rule', () => {
        const source = headers({ 'x-real-ip': '192.0.2.44', 'x-forwarded-for': '198.51.100.7' });
        expect(resolveClientIp(source, { trustedProxyHops: 1, trustedClientIpHeader: 'x-real-ip' })).toBe('192.0.2.44');
    });

    it('ignores x-real-ip and a client-supplied x-client-ip unless named as trusted', () => {
        const source = headers({ 'x-real-ip': '192.0.2.44', 'x-client-ip': '192.0.2.99' });
        expect(resolveClientIp(source, { trustedProxyHops: 0 })).toBeUndefined();
    });

    it('falls back to the hop rule when the trusted header is not an IP', () => {
        const source = headers({ 'x-real-ip': 'nope', 'x-forwarded-for': '198.51.100.7' });
        expect(resolveClientIp(source, { trustedProxyHops: 1, trustedClientIpHeader: 'x-real-ip' })).toBe('198.51.100.7');
    });
});
