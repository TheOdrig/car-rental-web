import { describe, it, expect } from 'vitest';
import { isSafeFilePath, toFileProxyUrl } from '../file-url';

describe('toFileProxyUrl', () => {
    it('maps an absolute API file URL to the same-origin proxy', () => {
        expect(toFileProxyUrl('http://localhost:8082/api/v1/files/avatars/a.png')).toBe('/api/files/avatars/a.png');
        expect(toFileProxyUrl('https://api.example.com/api/v1/files/damage-photos/b.jpg')).toBe(
            '/api/files/damage-photos/b.jpg'
        );
    });

    it('maps relative API file URLs and legacy upload paths', () => {
        expect(toFileProxyUrl('/api/v1/files/avatars/a.png')).toBe('/api/files/avatars/a.png');
        expect(toFileProxyUrl('uploads/avatars/a.png')).toBe('/api/files/avatars/a.png');
        expect(toFileProxyUrl('/uploads/damage-photos/b.png')).toBe('/api/files/damage-photos/b.png');
    });

    it('leaves proxied, third-party and empty values alone', () => {
        expect(toFileProxyUrl('/api/files/avatars/a.png')).toBe('/api/files/avatars/a.png');
        expect(toFileProxyUrl('https://lh3.googleusercontent.com/a/photo')).toBe(
            'https://lh3.googleusercontent.com/a/photo'
        );
        expect(toFileProxyUrl('/images/car.png')).toBe('/images/car.png');
        expect(toFileProxyUrl(null)).toBeUndefined();
        expect(toFileProxyUrl('  ')).toBeUndefined();
    });
});

describe('isSafeFilePath', () => {
    it('accepts plain segments and rejects traversal', () => {
        expect(isSafeFilePath(['avatars', 'a.png'])).toBe(true);
        expect(isSafeFilePath(['avatars', '..', 'secret'])).toBe(false);
        expect(isSafeFilePath(['avatars', 'a/b'])).toBe(false);
        expect(isSafeFilePath(['avatars', 'a\\b'])).toBe(false);
        expect(isSafeFilePath(['avatars', '%2e%2e'])).toBe(false);
        expect(isSafeFilePath([])).toBe(false);
        expect(isSafeFilePath([''])).toBe(false);
    });
});
