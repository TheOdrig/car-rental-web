import { describe, it, expect } from 'vitest';
import { pageMetadata } from '../seo';

describe('pageMetadata', () => {
    it('gives the page its own title, description, canonical path and Open Graph data', () => {
        const metadata = pageMetadata({ title: 'Browse Cars', description: 'All cars', path: '/cars' });

        expect(metadata.title).toBe('Browse Cars');
        expect(metadata.alternates).toEqual({ canonical: '/cars' });
        expect(metadata.openGraph).toMatchObject({ title: 'Browse Cars', description: 'All cars', url: '/cars' });
        expect(metadata.twitter).toMatchObject({ card: 'summary', title: 'Browse Cars' });
    });

    it('adds the image to Open Graph and upgrades the Twitter card', () => {
        const metadata = pageMetadata({ title: 'Audi A3', description: 'd', path: '/cars/1', image: 'https://img.test/a.jpg' });

        expect(metadata.openGraph).toMatchObject({ images: [{ url: 'https://img.test/a.jpg' }] });
        expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', images: ['https://img.test/a.jpg'] });
    });

    it('can opt out of the title template', () => {
        expect(pageMetadata({ title: 'Home', description: 'd', path: '/', absoluteTitle: true }).title).toEqual({ absolute: 'Home' });
    });
});
