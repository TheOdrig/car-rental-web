import { describe, it, expect } from 'vitest';
import { isAllowedHostname } from '@/shared/ui/dynamic-image';

describe('isAllowedHostname', () => {
    it('does not optimize authenticated file proxy sources', () => {
        expect(isAllowedHostname('/api/files/damage-photos/a.png')).toBe(false);
        expect(isAllowedHostname('/api/files/avatars/a.png')).toBe(false);
    });

    it('optimizes public same-origin assets and allowed hosts', () => {
        expect(isAllowedHostname('/images/hero.jpg')).toBe(true);
        expect(isAllowedHostname('https://lh3.googleusercontent.com/a')).toBe(true);
    });

    it('does not optimize other remote hosts', () => {
        expect(isAllowedHostname('https://example.com/a.png')).toBe(false);
    });
});
