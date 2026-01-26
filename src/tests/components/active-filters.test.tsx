import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveFilters } from '@/components/cars/active-filters';
import { useFilterStore } from '@/lib/stores/filter-store';

describe('ActiveFilters', () => {
    beforeEach(() => {
        useFilterStore.getState().clearFilters();
    });

    describe('rendering', () => {
        it('should render nothing when no filters are active', () => {
            const { container } = render(<ActiveFilters />);
            expect(container.firstChild).toBeNull();
        });

        it('should render a badge for each active filter', () => {
            useFilterStore.getState().setFilter('bodyType', 'SUV');
            useFilterStore.getState().setFilter('transmissionType', 'Automatic');

            render(<ActiveFilters />);

            expect(screen.getByText('Type:')).toBeInTheDocument();
            expect(screen.getByText('SUV')).toBeInTheDocument();
            expect(screen.getByText('Transmission:')).toBeInTheDocument();
            expect(screen.getByText('Automatic')).toBeInTheDocument();
        });

        it('should show "Clear all" button when multiple filters are active', () => {
            useFilterStore.getState().setFilter('bodyType', 'SUV');
            useFilterStore.getState().setFilter('transmissionType', 'Automatic');

            render(<ActiveFilters />);

            expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
        });

        it('should not show "Clear all" button when only one filter is active', () => {
            useFilterStore.getState().setFilter('bodyType', 'SUV');

            render(<ActiveFilters />);

            expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
        });

        it('should format price filters with dollar sign', () => {
            useFilterStore.getState().setFilter('minPrice', 50);
            useFilterStore.getState().setFilter('maxPrice', 200);

            render(<ActiveFilters />);

            expect(screen.getByText('$50')).toBeInTheDocument();
            expect(screen.getByText('$200')).toBeInTheDocument();
        });

        it('should format seats filter with plus sign', () => {
            useFilterStore.getState().setFilter('minSeats', 5);

            render(<ActiveFilters />);

            expect(screen.getByText('5+')).toBeInTheDocument();
        });

        it('should display correct labels for filter types', () => {
            useFilterStore.getState().setFilter('brand', 'Toyota');
            useFilterStore.getState().setFilter('fuelType', 'Electric');

            render(<ActiveFilters />);

            expect(screen.getByText('Brand:')).toBeInTheDocument();
            expect(screen.getByText('Fuel:')).toBeInTheDocument();
        });
    });

    describe('filter removal', () => {
        it('should have remove button for each filter badge', () => {
            useFilterStore.getState().setFilter('bodyType', 'SUV');
            useFilterStore.getState().setFilter('transmissionType', 'Automatic');

            render(<ActiveFilters />);

            expect(screen.getByRole('button', { name: 'Remove Type filter' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Remove Transmission filter' })).toBeInTheDocument();
        });

        it('should remove filter when X button is clicked', async () => {
            const user = userEvent.setup();
            useFilterStore.getState().setFilter('bodyType', 'SUV');
            useFilterStore.getState().setFilter('transmissionType', 'Automatic');

            render(<ActiveFilters />);

            await user.click(screen.getByRole('button', { name: 'Remove Type filter' }));

            expect(useFilterStore.getState().filters.bodyType).toBeUndefined();
            expect(useFilterStore.getState().filters.transmissionType).toBe('Automatic');
        });

        it('should clear all filters when "Clear all" is clicked', async () => {
            const user = userEvent.setup();
            useFilterStore.getState().setFilter('bodyType', 'SUV');
            useFilterStore.getState().setFilter('transmissionType', 'Automatic');
            useFilterStore.getState().setFilter('minPrice', 50);

            render(<ActiveFilters />);

            await user.click(screen.getByRole('button', { name: 'Clear all' }));

            const { filters } = useFilterStore.getState();
            expect(filters.bodyType).toBeUndefined();
            expect(filters.transmissionType).toBeUndefined();
            expect(filters.minPrice).toBeUndefined();
        });

        it('should render nothing after all filters are removed', async () => {
            const user = userEvent.setup();
            useFilterStore.getState().setFilter('bodyType', 'SUV');

            const { container, rerender } = render(<ActiveFilters />);

            await user.click(screen.getByRole('button', { name: 'Remove Type filter' }));

            rerender(<ActiveFilters />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should not render badge for undefined filter values', () => {
            useFilterStore.getState().setFilter('bodyType', undefined);

            const { container } = render(<ActiveFilters />);

            expect(container.firstChild).toBeNull();
        });

        it('should not render badge for empty string filter values', () => {
            useFilterStore.getState().setFilter('brand', '');

            const { container } = render(<ActiveFilters />);

            expect(container.firstChild).toBeNull();
        });

        it('should handle numeric zero value correctly', () => {
            useFilterStore.getState().setFilter('minPrice', 0);

            render(<ActiveFilters />);

            expect(screen.getByText('$0')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            useFilterStore.getState().setFilter('bodyType', 'SUV');

            const { container } = render(<ActiveFilters className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});

