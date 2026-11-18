import { describe, it, expect } from 'vitest';
import { classifyRoute } from '../route-access';

describe('classifyRoute', () => {
    it.each([
        ['/', 'public'],
        ['/cars', 'public'],
        ['/cars/12', 'public'],
        ['/search', 'public'],
        ['/forbidden', 'public'],
        ['/api/cars', 'public'],
        ['/api/auth/login', 'public'],
        ['/login', 'guest-only'],
        ['/register', 'guest-only'],
        ['/forgot-password', 'guest-only'],
        ['/reset-password', 'auth-flow'],
        ['/admin', 'admin'],
        ['/admin/users/3', 'admin'],
        ['/api/admin/users', 'admin-api'],
        ['/dashboard', 'protected'],
        ['/rentals/9', 'protected'],
        ['/settings/profile', 'protected'],
        ['/checkout', 'protected'],
        ['/unknown-page', 'protected'],
    ])('%s is %s', (path, expected) => {
        expect(classifyRoute(path)).toBe(expected);
    });

    it('does not treat lookalike prefixes as admin or public', () => {
        expect(classifyRoute('/administrator')).toBe('protected');
        expect(classifyRoute('/carsX')).toBe('protected');
        expect(classifyRoute('/api-docs')).toBe('protected');
    });
});
