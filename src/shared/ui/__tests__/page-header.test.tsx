import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../page-header';

describe('PageHeader', () => {
    it('renders a single level-one heading with the description under it', () => {
        render(<PageHeader title="Fleet Management" description="Manage your vehicle inventory" />);

        expect(screen.getByRole('heading', { level: 1, name: 'Fleet Management' })).toBeInTheDocument();
        expect(screen.getByText('Manage your vehicle inventory')).toBeInTheDocument();
    });

    it('renders the breadcrumb slot before the heading and the actions after it', () => {
        render(
            <PageHeader
                title="Rentals"
                breadcrumb={<nav aria-label="Breadcrumb">Dashboard</nav>}
                actions={<button type="button">Refresh</button>}
            />
        );

        const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
        const heading = screen.getByRole('heading', { level: 1 });
        const action = screen.getByRole('button', { name: 'Refresh' });

        expect(crumbs.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(heading.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('uses the page scale by default and the smaller detail scale on request', () => {
        const { rerender } = render(<PageHeader title="Rentals" />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-3xl');

        rerender(<PageHeader title="Rental CR-1" size="detail" />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-2xl');
    });

    it('can take focus programmatically when asked to', () => {
        render(<PageHeader title="Rental CR-1" focusable />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
    });
});
