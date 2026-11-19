import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockSimilar = vi.hoisted(() => vi.fn());

vi.mock('@/entities/car/lib/use-cars', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/entities/car/lib/use-cars')>()),
    useSimilarCars: mockSimilar,
}));

import { SimilarCarsSection } from '../similar-cars-section';

describe('SimilarCarsSection', () => {
    it('explains that nothing is similar instead of disappearing', () => {
        mockSimilar.mockReturnValue({ data: [], isLoading: false, isError: false });

        render(<SimilarCarsSection carId={3} />);

        expect(screen.getByRole('heading', { name: 'Similar Vehicles' })).toBeInTheDocument();
        expect(screen.getByText(/no similar vehicles/i)).toBeInTheDocument();
    });

    it('stays hidden when the request failed', () => {
        mockSimilar.mockReturnValue({ data: undefined, isLoading: false, isError: true });

        const { container } = render(<SimilarCarsSection carId={3} />);

        expect(container).toBeEmptyDOMElement();
    });
});
