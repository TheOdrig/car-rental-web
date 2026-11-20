import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingSuccess, BookingSuccessLoader } from '@/features/book-car';
const mockUseRental = vi.hoisted(() => vi.fn());
vi.mock('@/entities/rental', async () => {
    const actual = await vi.importActual<typeof import('@/entities/rental')>('@/entities/rental');
    return { ...actual, useRental: mockUseRental };
});
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}));
describe('BookingSuccess', () => {
    const defaultProps = {
        referenceNumber: 'ABC12345',
    };
    it('should display booking requested heading', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByText('Booking requested')).toBeInTheDocument();
    });
    it('should display booking reference number', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByText('ABC12345')).toBeInTheDocument();
        expect(screen.getByText('Booking Reference')).toBeInTheDocument();
    });
    it('should display car name when provided', () => {
        render(<BookingSuccess {...defaultProps} carName="BMW 3 Series" />);
        expect(screen.getByText('BMW 3 Series')).toBeInTheDocument();
    });
    it('should display default car name when not provided', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByText('Your Selected Vehicle')).toBeInTheDocument();
    });
    it('should display rental dates when provided', () => {
        render(
            <BookingSuccess
                {...defaultProps}
                startDate="2024-01-15"
                endDate="2024-01-20"
            />
        );
        expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 20, 2024/)).toBeInTheDocument();
    });
    it('should not show a made-up pickup location', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.queryByText(/pickup location/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Main Office')).not.toBeInTheDocument();
    });
    it('should not claim any payment was made', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.queryByText(/total paid/i)).not.toBeInTheDocument();
    });
    it('should display what\'s next section', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByText("What's Next?")).toBeInTheDocument();
        expect(screen.getByText(/Once it is confirmed, pay for it/i)).toBeInTheDocument();
    });
    it('should have View Booking Details button', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByRole('link', { name: /view booking details/i })).toBeInTheDocument();
    });
    it('should have Return to Home button', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument();
    });
    it('should not offer a receipt for an unpaid request', () => {
        render(<BookingSuccess {...defaultProps} />);
        expect(screen.queryByRole('button', { name: /print receipt/i })).not.toBeInTheDocument();
    });
});

describe('BookingSuccessLoader', () => {
    it('loads the rental by id and shows the real car and dates', () => {
        mockUseRental.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                id: 42,
                startDate: '2024-03-01',
                endDate: '2024-03-04',
                carSummary: { id: 1, brand: 'Fiat', model: 'Egea', licensePlate: '34ABC34' },
            },
        });
        render(<BookingSuccessLoader referenceNumber="42" />);

        expect(mockUseRental).toHaveBeenCalledWith(42);
        expect(screen.getByText('Fiat Egea')).toBeInTheDocument();
        expect(screen.getByText(/Mar 1, 2024 - Mar 4, 2024/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view booking details/i })).toHaveAttribute('href', '/rentals/42');
    });

    it('does not query a rental for a non numeric reference and shows an error state', () => {
        mockUseRental.mockReturnValue({ data: undefined, isLoading: false, isError: false });
        render(<BookingSuccessLoader referenceNumber="ABC" />);

        expect(mockUseRental).toHaveBeenCalledWith(null);
        expect(screen.getByRole('alert')).toHaveTextContent(/could not load this booking/i);
        expect(screen.queryByText('Booking requested')).not.toBeInTheDocument();
    });

    it('shows an error state instead of success when the rental cannot be read', () => {
        mockUseRental.mockReturnValue({ data: undefined, isLoading: false, isError: true });
        render(<BookingSuccessLoader referenceNumber="1" />);

        expect(screen.getByRole('alert')).toHaveTextContent(/could not load this booking/i);
        expect(screen.getByRole('link', { name: /my rentals/i })).toHaveAttribute('href', '/rentals');
        expect(screen.queryByText('Booking requested')).not.toBeInTheDocument();
        expect(document.title).toBe('Booking not found');
    });

    it('shows a loading state while the rental loads', () => {
        mockUseRental.mockReturnValue({ data: undefined, isLoading: true, isError: false });
        const { container } = render(<BookingSuccessLoader referenceNumber="1" />);

        expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
        expect(screen.queryByText('Booking requested')).not.toBeInTheDocument();
    });
});
