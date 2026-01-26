import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingFailure } from '@/components/booking/booking-failure';

const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: mockBack,
    }),
}));

describe('BookingFailure', () => {
    beforeEach(() => {
        mockBack.mockClear();
    });

    it('should display payment failed heading', () => {
        render(<BookingFailure />);

        expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    });

    it('should display custom error message when provided', () => {
        render(<BookingFailure errorMessage="Your card was declined" />);

        expect(screen.getByText('Your card was declined')).toBeInTheDocument();
    });

    it('should display error message based on error code', () => {
        render(<BookingFailure errorCode="insufficient_funds" />);

        expect(
            screen.getByText(/declined due to insufficient funds/i)
        ).toBeInTheDocument();
    });

    it('should display default error message when no error provided', () => {
        render(<BookingFailure />);

        expect(
            screen.getByText(/unable to process your payment/i)
        ).toBeInTheDocument();
    });

    it('should have Try Again button', () => {
        render(<BookingFailure />);

        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have Use Different Card button', () => {
        render(<BookingFailure />);

        expect(
            screen.getByRole('button', { name: /use different card/i })
        ).toBeInTheDocument();
    });

    it('should have Browse Other Cars link', () => {
        render(<BookingFailure />);

        expect(
            screen.getByRole('link', { name: /browse other cars/i })
        ).toBeInTheDocument();
    });

    it('should display need help section', () => {
        render(<BookingFailure />);

        expect(screen.getByText('Need Help?')).toBeInTheDocument();
        expect(screen.getByText(/24\/7/i)).toBeInTheDocument();
    });

    it('should display support phone number', () => {
        render(<BookingFailure />);

        expect(screen.getByText('1-800-CAR-RENT')).toBeInTheDocument();
    });

    it('should call router.back when Try Again is clicked', async () => {
        const user = userEvent.setup();
        render(<BookingFailure />);

        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        await user.click(tryAgainButton);

        expect(mockBack).toHaveBeenCalled();
    });
});

