import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalForm } from '@/features/manage-rentals';
import type { Car } from '@/entities/car';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const car = {
    id: 7,
    brand: 'Fiat',
    model: 'Egea',
    price: 1500,
    currencyType: 'TRY',
} as unknown as Car;

describe('RentalForm', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    it('offers one honest request path without payment promises', () => {
        render(<RentalForm car={car} />);

        expect(screen.getByRole('button', { name: /request rental/i })).toBeInTheDocument();
        expect(screen.queryByText(/pay now/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/instant confirmation/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/redirected to secure payment/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/payment method/i)).not.toBeInTheDocument();
        expect(screen.getByText(/payment comes after approval/i)).toBeInTheDocument();
    });

    it('shows the daily rate in the car currency as an en-US amount', () => {
        render(<RentalForm car={car} />);

        expect(screen.getByText(/₺1,500\.00/)).toBeInTheDocument();
    });

    it('does not navigate when no dates were chosen', async () => {
        const { container } = render(<RentalForm car={car} />);
        const form = container.querySelector('form')!;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(mockPush).not.toHaveBeenCalled();
    });
});
