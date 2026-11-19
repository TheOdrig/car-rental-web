import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RentalStatus, type Rental } from '@/entities/rental';
import { MyRentalsContent } from '../my-rentals-content';

const mockUseAllMyRentals = vi.hoisted(() => vi.fn());

let query = '';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    usePathname: () => '/rentals',
    useSearchParams: () => new URLSearchParams(query),
}));
vi.mock('@/entities/rental', async () => {
    const actual = await vi.importActual<typeof import('@/entities/rental')>('@/entities/rental');
    return {
        ...actual,
        useAllMyRentals: mockUseAllMyRentals,
        useCancelRental: () => ({ mutate: vi.fn() }),
    };
});

function rental(id: number, status: RentalStatus = RentalStatus.RETURNED): Rental {
    return {
        id,
        startDate: '2024-03-01',
        endDate: '2024-03-04',
        totalPrice: 100,
        currency: 'USD',
        status,
        carSummary: { id: id, brand: 'Brand', model: `Model${id}`, licensePlate: `PLATE${id}` },
    } as unknown as Rental;
}

describe('MyRentalsContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        query = '';
        push.mockImplementation((url: string) => {
            query = url.split('?')[1] ?? '';
        });
    });

    it('computes tabs over every rental and pages the list client side', async () => {
        const rentals = [
            ...Array.from({ length: 24 }, (_, i) => rental(i + 1)),
            rental(100, RentalStatus.IN_USE),
        ];
        mockUseAllMyRentals.mockReturnValue({ data: rentals, isLoading: false, isError: false, refetch: vi.fn() });

        const view = render(<MyRentalsContent />);

        expect(screen.getByRole('tab', { name: /all/i })).toHaveTextContent('25');
        expect(screen.getAllByText('Brand Model1').length).toBeGreaterThan(0);
        expect(screen.queryByText('Brand Model11')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
        expect(push).toHaveBeenCalledWith('/rentals?page=2', { scroll: false });
        view.rerender(<MyRentalsContent />);

        expect(screen.getAllByText('Brand Model11').length).toBeGreaterThan(0);
        expect(screen.queryByText('Brand Model1')).not.toBeInTheDocument();
    });

    it('shows an error with retry instead of zero rentals', async () => {
        const refetch = vi.fn();
        mockUseAllMyRentals.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<MyRentalsContent />);

        expect(screen.getByText('Failed to load rentals')).toBeInTheDocument();
        expect(screen.queryByText(/no rentals/i)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});

describe('MyRentalsContent tabs in the address', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        query = '';
        push.mockImplementation((url: string) => {
            query = url.split('?')[1] ?? '';
        });
    });

    it('opens the tab named in the address and writes a clicked tab back', async () => {
        const rentals = [rental(1, RentalStatus.CANCELLED), rental(2)];
        mockUseAllMyRentals.mockReturnValue({ data: rentals, isLoading: false, isError: false, refetch: vi.fn() });
        query = 'tab=cancelled';

        const view = render(<MyRentalsContent />);

        expect(screen.getByRole('tab', { name: /cancelled/i })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getAllByText('Brand Model1').length).toBeGreaterThan(0);
        expect(screen.queryByText('Brand Model2')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('tab', { name: /^all/i }));
        expect(push).toHaveBeenCalledWith('/rentals', { scroll: false });
        view.rerender(<MyRentalsContent />);
        expect(screen.getByRole('tab', { name: /^all/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('ignores an unknown tab in the address', () => {
        mockUseAllMyRentals.mockReturnValue({ data: [rental(1)], isLoading: false, isError: false, refetch: vi.fn() });
        query = 'tab=bogus';

        render(<MyRentalsContent />);

        expect(screen.getByRole('tab', { name: /^all/i })).toHaveAttribute('aria-selected', 'true');
    });
});
