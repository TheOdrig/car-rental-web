import { describe, it, expect } from 'vitest';
import { classifyRoute } from '../route-access';

describe('removed placeholder routes', () => {
    it.each(['/about', '/locations', '/callback'])('%s is not a known route, so it reaches the 404 page instead of the login redirect', (path) => {
        expect(classifyRoute(path)).toBe('public');
    });
});
