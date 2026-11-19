import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';

describe('Footer', () => {
    it('links only to pages that exist', () => {
        render(<Footer />);

        const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
        expect(hrefs).toContain('/cars');
        expect(hrefs).toContain('/terms');
        expect(hrefs).toContain('/privacy');
        expect(hrefs).not.toContain('/about');
        expect(hrefs).not.toContain('/locations');
        expect(screen.queryByText('Soon')).not.toBeInTheDocument();
    });
});
