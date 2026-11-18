import { describe, it, expect } from 'vitest';
import { classifyRoute } from '../route-access';

describe('removed placeholder routes', () => {
    it.each(['/about', '/locations'])('%s is no longer treated as a public page', (path) => {
        expect(classifyRoute(path)).toBe('protected');
    });
});
