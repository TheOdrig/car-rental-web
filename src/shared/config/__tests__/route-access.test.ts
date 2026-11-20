import { describe, it, expect } from 'vitest';
import { classifyRoute, isChromelessRoute } from '../route-access';

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
        ['/booking/success', 'protected'],
        ['/damages/4', 'protected'],
        ['/terms', 'public'],
        ['/privacy', 'public'],
        ['/unknown-page', 'public'],
        ['/this/does/not/exist', 'public'],
    ])('%s is %s', (path, expected) => {
        expect(classifyRoute(path)).toBe(expected);
    });

    it('does not treat lookalike prefixes as admin, public or protected', () => {
        expect(classifyRoute('/administrator')).toBe('public');
        expect(classifyRoute('/carsX')).toBe('public');
        expect(classifyRoute('/api-docs')).toBe('public');
        expect(classifyRoute('/rentalsX')).toBe('public');
    });
});

describe('isChromelessRoute', () => {
    it('is true only for the auth pages that draw their own header and footer', () => {
        expect(isChromelessRoute('/login')).toBe(true);
        expect(isChromelessRoute('/register')).toBe(true);
        expect(isChromelessRoute('/reset-password')).toBe(true);
        expect(isChromelessRoute('/admin/dashboard')).toBe(true);
        expect(isChromelessRoute('/admin')).toBe(true);
        expect(isChromelessRoute('/administrator')).toBe(false);
        expect(isChromelessRoute('/cars')).toBe(false);
        expect(isChromelessRoute('/loginx')).toBe(false);
        expect(isChromelessRoute(null)).toBe(false);
    });
});
