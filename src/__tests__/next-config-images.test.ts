import { describe, it, expect } from 'vitest';
import nextConfig, { buildContentSecurityPolicy } from '../../next.config';

describe('avatar image hosts', () => {
    it('allows the Google and GitHub avatar hosts in next/image', () => {
        const hosts = (nextConfig.images?.remotePatterns ?? []).map((pattern) => (pattern as { hostname: string }).hostname);

        expect(hosts).toContain('lh3.googleusercontent.com');
        expect(hosts).toContain('avatars.githubusercontent.com');
    });

    it('lets the CSP load images from any https origin', () => {
        const csp = buildContentSecurityPolicy({ isDevelopment: false });
        const imgSrc = csp.split('; ').find((part) => part.startsWith('img-src '));

        expect(imgSrc?.split(' ')).toContain('https:');
    });
});
