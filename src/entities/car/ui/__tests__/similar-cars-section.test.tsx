import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockSimilar = vi.hoisted(() => vi.fn());

vi.mock('@/entities/car/api/use-cars', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/entities/car/api/use-cars')>()),
    useSimilarCars: mockSimilar,
}));

import { SimilarCarsSection } from '../similar-cars-section';

describe('SimilarCarsSection', () => {
    it('hides the whole section when nothing is similar', () => {
        mockSimilar.mockReturnValue({ data: [], isLoading: false, isError: false });

        const { container } = render(<SimilarCarsSection carId={3} />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('heading', { name: 'Similar Vehicles' })).not.toBeInTheDocument();
    });

    it('shows the heading while the list loads', () => {
        mockSimilar.mockReturnValue({ data: undefined, isLoading: true, isError: false });

        render(<SimilarCarsSection carId={3} />);

        expect(screen.getByRole('heading', { name: 'Similar Vehicles' })).toBeInTheDocument();
    });

    it('stays hidden when the request failed', () => {
        mockSimilar.mockReturnValue({ data: undefined, isLoading: false, isError: true });

        const { container } = render(<SimilarCarsSection carId={3} />);

        expect(container).toBeEmptyDOMElement();
    });
});
