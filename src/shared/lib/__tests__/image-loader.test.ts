import { describe, it, expect } from 'vitest';
import { isUnsplashUrl, unsplashImageUrl, unsplashLoader } from '../image-loader';

describe('unsplash image loader', () => {
    it('recognises only the Unsplash image host', () => {
        expect(isUnsplashUrl('https://images.unsplash.com/photo-1?w=2000')).toBe(true);
        expect(isUnsplashUrl('https://example.com/photo.jpg')).toBe(false);
        expect(isUnsplashUrl('/images/car-placeholder.svg')).toBe(false);
    });

    it('replaces width and quality and requests an automatic format', () => {
        const url = new URL(unsplashImageUrl('https://images.unsplash.com/photo-1?auto=format&fit=crop&q=80&w=2000', 640, 70));

        expect(url.searchParams.get('w')).toBe('640');
        expect(url.searchParams.get('q')).toBe('70');
        expect(url.searchParams.get('auto')).toBe('format');
        expect(url.searchParams.get('fit')).toBe('crop');
        expect(url.searchParams.getAll('w')).toHaveLength(1);
    });

    it('adds the crop fit when the source has none and uses the default quality', () => {
        const url = new URL(unsplashLoader({ src: 'https://images.unsplash.com/photo-2', width: 384 }));

        expect(url.searchParams.get('fit')).toBe('crop');
        expect(url.searchParams.get('q')).toBe('75');
        expect(url.searchParams.get('w')).toBe('384');
    });
});
