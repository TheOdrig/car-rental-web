import { describe, expect, it } from 'vitest';
import { ROLE_CONFIG } from '../user-display';

describe('ROLE_CONFIG', () => {
    it('uses a distinct colour for every role', () => {
        const dots = Object.values(ROLE_CONFIG).map((config) => config.dotColor);
        expect(new Set(dots).size).toBe(dots.length);
    });
});
