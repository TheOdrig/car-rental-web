import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';
import { toDateInputValue } from '@/entities/rental';
import { RentalForm } from '@/features/manage-rentals';
import type { Car } from '@/entities/car';

const mockPush = vi.fn();
const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});
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
        clientGet.mockReset();
        clientGet.mockResolvedValue({ carId: 7, month: '2026-01', carBlocked: false, days: [] });
    });

    it('offers one honest request path without payment promises', () => {
        renderWithProviders(<RentalForm car={car} />);

        expect(screen.getByRole('button', { name: /request rental/i })).toBeInTheDocument();
        expect(screen.queryByText(/pay now/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/instant confirmation/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/redirected to secure payment/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/payment method/i)).not.toBeInTheDocument();
        expect(screen.getByText(/payment comes after approval/i)).toBeInTheDocument();
    });

    it('shows the daily rate in the car currency as an en-US amount', () => {
        renderWithProviders(<RentalForm car={car} />);

        expect(screen.getByText(/₺1,500\.00/)).toBeInTheDocument();
    });

    it('does not navigate when no dates were chosen', async () => {
        const { container } = renderWithProviders(<RentalForm car={car} />);
        const form = container.querySelector('form')!;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('disables a date the availability calendar reports as booked', async () => {
        const user = userEvent.setup();
        const today = new Date();
        const key = toDateInputValue(today);
        clientGet.mockResolvedValue({
            carId: 7,
            month: key.slice(0, 7),
            carBlocked: false,
            days: [{ date: key, status: 'Unavailable', rentalId: 3 }],
        });

        renderWithProviders(<RentalForm car={car} />);
        await user.click(screen.getAllByRole('button', { name: /select date/i })[0]);

        await waitFor(() => expect(document.querySelector(`[data-day="${key}"] button`)).toBeDisabled());
    });

    it('closes the date popover once a date was picked', async () => {
        const user = userEvent.setup();
        const day = new Date();
        day.setDate(day.getDate() + 3);
        const key = toDateInputValue(day);

        renderWithProviders(<RentalForm car={car} />);
        await user.click(screen.getAllByRole('button', { name: /select date/i })[0]);
        await waitFor(() => expect(document.querySelector(`[data-day="${key}"] button`)).not.toBeNull());
        await user.click(document.querySelector(`[data-day="${key}"] button`) as HTMLElement);

        await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument());
    });

    it('does not let the calendar move into past months or request them', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RentalForm car={car} />);

        await user.click(screen.getAllByRole('button', { name: /select date/i })[0]);

        const previous = await screen.findByRole('button', { name: /previous month/i });
        expect(previous).toHaveAttribute('aria-disabled', 'true');
        await user.click(previous);
        const months = clientGet.mock.calls.map(([url]) => String(url));
        expect(months.every((url) => url.includes(new Date().toISOString().slice(0, 4)))).toBe(true);
        expect(months).toHaveLength(1);
    });
});
