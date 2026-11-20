import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveDataView } from '../responsive-data-view';

describe('ResponsiveDataView', () => {
    it('shows the mobile render below md and the desktop render from md by default', () => {
        render(<ResponsiveDataView mobile={<p>cards</p>} desktop={<p>table</p>} />);

        expect(screen.getByText('cards').parentElement).toHaveClass('md:hidden');
        expect(screen.getByText('table').parentElement).toHaveClass('hidden', 'md:block');
    });

    it('can switch at lg instead', () => {
        render(<ResponsiveDataView switchAt="lg" mobile={<p>cards</p>} desktop={<p>table</p>} />);

        expect(screen.getByText('cards').parentElement).toHaveClass('lg:hidden');
        expect(screen.getByText('table').parentElement).toHaveClass('hidden', 'lg:block');
        expect(screen.getByText('cards').parentElement).not.toHaveClass('md:hidden');
    });

    it('passes the class name to the wrapper', () => {
        const { container } = render(<ResponsiveDataView className="mt-4" mobile={<p>a</p>} desktop={<p>b</p>} />);

        expect(container.firstChild).toHaveClass('mt-4');
    });
});
