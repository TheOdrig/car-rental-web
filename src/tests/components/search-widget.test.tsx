import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchWidget } from '@/components/home/search-widget';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('SearchWidget', () => {
    beforeEach(() => {
        mockPush.mockClear();
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();
        window.HTMLElement.prototype.setPointerCapture = vi.fn();
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    });

    describe('rendering', () => {
        it('should render all form fields', () => {
            render(<SearchWidget />);

            expect(screen.getByText('Location')).toBeInTheDocument();
            expect(screen.getByText('Pickup Date')).toBeInTheDocument();
            expect(screen.getByText('Return Date')).toBeInTheDocument();
            expect(screen.getByText('Vehicle Type')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
        });

        it('should render location input with placeholder', () => {
            render(<SearchWidget />);

            expect(screen.getByPlaceholderText('City or airport')).toBeInTheDocument();
        });

        it('should render date placeholders', () => {
            render(<SearchWidget />);

            expect(screen.getAllByText('Select date')).toHaveLength(2);
        });

        it('should apply custom className', () => {
            const { container } = render(<SearchWidget className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('validation', () => {
        it('should show error when pickup date is not selected', async () => {
            const user = userEvent.setup();
            render(<SearchWidget />);

            await user.click(screen.getByRole('button', { name: /search/i }));

            expect(screen.getByText('Pickup date is required')).toBeInTheDocument();
        });

        it('should show error when return date is not selected', async () => {
            const user = userEvent.setup();
            render(<SearchWidget />);

            await user.click(screen.getByRole('button', { name: /search/i }));

            expect(screen.getByText('Return date is required')).toBeInTheDocument();
        });

        it('should not navigate when validation fails', async () => {
            const user = userEvent.setup();
            render(<SearchWidget />);

            await user.click(screen.getByRole('button', { name: /search/i }));

            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    describe('location input', () => {
        it('should allow typing in location field', async () => {
            const user = userEvent.setup();
            render(<SearchWidget />);

            const locationInput = screen.getByPlaceholderText('City or airport');
            await user.type(locationInput, 'Istanbul');

            expect(locationInput).toHaveValue('Istanbul');
        });
    });

    describe('vehicle type dropdown', () => {
        it('should have vehicle type dropdown', () => {
            render(<SearchWidget />);

            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });
    });

    describe('search button', () => {
        it('should have search icon and text', () => {
            render(<SearchWidget />);

            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeInTheDocument();
        });

        it('should be full width', () => {
            render(<SearchWidget />);

            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('w-full');
        });
    });

    describe('accessibility', () => {
        it('should have labels for all form fields', () => {
            render(<SearchWidget />);

            expect(screen.getByText('Location')).toBeInTheDocument();
            expect(screen.getByText('Pickup Date')).toBeInTheDocument();
            expect(screen.getByText('Return Date')).toBeInTheDocument();
            expect(screen.getByText('Vehicle Type')).toBeInTheDocument();
        });
    });
});

