import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingSuccess } from '@/components/booking/booking-success';

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

    it('should display booking confirmed heading', () => {
        render(<BookingSuccess {...defaultProps} />);

        expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
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
                startDate={new Date('2024-01-15')}
                endDate={new Date('2024-01-20')}
            />
        );

        expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 20, 2024/)).toBeInTheDocument();
    });

    it('should display pickup location', () => {
        render(<BookingSuccess {...defaultProps} pickupLocation="Airport Terminal" />);

        expect(screen.getByText('Airport Terminal')).toBeInTheDocument();
    });

    it('should display total paid when provided', () => {
        render(<BookingSuccess {...defaultProps} totalPaid={299.99} />);

        expect(screen.getByText('$299.99 USD')).toBeInTheDocument();
    });

    it('should display what\'s next section', () => {
        render(<BookingSuccess {...defaultProps} />);

        expect(screen.getByText("What's Next?")).toBeInTheDocument();
        expect(screen.getByText(/confirmation email/i)).toBeInTheDocument();
    });

    it('should have View Booking Details button', () => {
        render(<BookingSuccess {...defaultProps} />);

        expect(screen.getByRole('link', { name: /view booking details/i })).toBeInTheDocument();
    });

    it('should have Return to Home button', () => {
        render(<BookingSuccess {...defaultProps} />);

        expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument();
    });

    it('should have Print Receipt button', () => {
        render(<BookingSuccess {...defaultProps} />);

        expect(screen.getByRole('button', { name: /print receipt/i })).toBeInTheDocument();
    });
});
