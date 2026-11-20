import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ImageProps } from 'next/image';

vi.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, loader, unoptimized, sizes }: ImageProps) => (
        <img
            src={typeof src === 'string' ? src : ''}
            alt={alt}
            data-sized={loader ? loader({ src: String(src), width: 640, quality: 70 }) : ''}
            data-unoptimized={String(unoptimized)}
            data-sizes={sizes}
        />
    ),
}));

import { DynamicImage } from '../dynamic-image';

describe('DynamicImage with Unsplash photos', () => {
    it('hands next/image a loader that sizes the photo and keeps it optimized', () => {
        const { container } = render(
            <DynamicImage src="https://images.unsplash.com/photo-1?auto=format&fit=crop&q=80&w=2000" alt="Hero" fill sizes="100vw" />
        );
        const img = container.querySelector('img');
        const sized = new URL(img!.getAttribute('data-sized')!);

        expect(sized.hostname).toBe('images.unsplash.com');
        expect(sized.searchParams.get('w')).toBe('640');
        expect(sized.searchParams.get('q')).toBe('70');
        expect(sized.searchParams.get('auto')).toBe('format');
        expect(img?.getAttribute('data-unoptimized')).toBe('false');
        expect(img?.getAttribute('data-sizes')).toBe('100vw');
    });

    it('leaves other remote hosts unoptimized and without a loader', () => {
        const { container } = render(<DynamicImage src="https://example.com/a.png" alt="x" width={100} height={80} />);
        const img = container.querySelector('img');

        expect(img?.getAttribute('data-sized')).toBe('');
        expect(img?.getAttribute('data-unoptimized')).toBe('true');
    });
});
