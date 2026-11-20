import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Car } from 'lucide-react';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
    it('renders the title and description', () => {
        render(<EmptyState title="No vehicles" description="Try another filter" />);

        expect(screen.getByRole('heading', { name: 'No vehicles' })).toBeInTheDocument();
        expect(screen.getByText('Try another filter')).toBeInTheDocument();
    });

    it('uses a custom icon and hides it from assistive technology', () => {
        const { container } = render(<EmptyState icon={Car} title="No vehicles" />);

        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('tightens the spacing in the compact size', () => {
        const { container } = render(<EmptyState size="compact" title="No vehicles" />);

        expect(container.firstChild).toHaveClass('py-8');
    });

    it('renders children below the message', () => {
        render(<EmptyState title="No alerts"><button type="button">Clear filters</button></EmptyState>);

        expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    });
});
