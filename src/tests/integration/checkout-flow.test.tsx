import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyProvider } from '@/lib/providers/currency-provider';

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    }),
}));

vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: { src: string; alt: string }) => (
        <img src={src} alt={alt} {...props} />
    ),
}));

vi.mock('@/components/ui/dynamic-image', () => ({
    DynamicImage: ({ src, alt, ...props }: { src: string; alt: string }) => (
        <img src={src} alt={alt} {...props} />
    ),
}));

vi.mock('@/lib/hooks/use-cars', () => ({
    useCar: vi.fn(() => ({
        data: {
            car: {
                id: 1,
                brand: 'BMW',
                model: '3 Series',
                price: 100,
                currencyType: 'USD',
                imageUrl: '/car.jpg',
                productionYear: 2023,
                transmissionType: 'Automatic',
                fuelType: 'Petrol',
            },
        },
        isLoading: false,
        error: null,
    })),
}));

vi.mock('@/lib/hooks', () => ({
    useAuth: vi.fn(() => ({
        user: null,
    })),
}));

import { CheckoutForm } from '@/components/checkout/checkout-form';
import React from "react";

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

function renderWithProviders(component: React.ReactElement) {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <CurrencyProvider>
                {component}
            </CurrencyProvider>
        </QueryClientProvider>
    );
}

describe('Checkout Flow Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockPush.mockClear();
        mockBack.mockClear();
        vi.clearAllMocks();
    });

    const defaultProps = {
        carId: '1',
        startDate: '2024-01-15',
        endDate: '2024-01-18',
        pickupLocation: 'Main Office',
    };

    describe('Form Rendering', () => {
        it('should render all checkout sections', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByText('Personal Details')).toBeInTheDocument();
            expect(screen.getByText('Payment Method')).toBeInTheDocument();
            expect(screen.getByText('Protection & Extras')).toBeInTheDocument();
        });

        it('should render booking summary with car info', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByText('BMW 3 Series')).toBeInTheDocument();
        });

        it('should render Confirm & Pay button', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByRole('button', { name: /confirm & pay/i })).toBeInTheDocument();
        });
    });

    describe('Form Input Formatting', () => {
        it('should format card number with spaces', async () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            const cardInput = screen.getByLabelText(/card number/i);
            await user.type(cardInput, '4111111111111111');

            expect(cardInput).toHaveValue('4111 1111 1111 1111');
        });

        it('should format expiry date as MM/YY', async () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            const expiryInput = screen.getByLabelText(/expiry/i);
            await user.type(expiryInput, '1225');

            expect(expiryInput).toHaveValue('12/25');
        });

        it('should limit CVC to 3 digits', async () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            const cvcInput = screen.getByLabelText(/cvc/i);
            await user.type(cvcInput, '12345');

            expect(cvcInput).toHaveValue('123');
        });
    });

    describe('Addon Selection', () => {
        it('should display addon options', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByText('Collision Damage Waiver')).toBeInTheDocument();
            expect(screen.getByText('GPS Navigation System')).toBeInTheDocument();
        });

        it.skip('should toggle addon selection', async () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            const cdwCheckbox = screen.getByRole('checkbox', { name: /collision damage waiver/i });
            expect(cdwCheckbox).not.toBeChecked();

            await user.click(cdwCheckbox);
            expect(cdwCheckbox).toBeChecked();

            await user.click(cdwCheckbox);
            expect(cdwCheckbox).not.toBeChecked();
        });
    });
});

describe('Success/Failure Pages', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockBack.mockClear();
    });

    it('should display success confirmation', async () => {
        const { BookingSuccess } = await import('@/components/booking/booking-success');

        render(<BookingSuccess referenceNumber="ABC12345" />);

        expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
        expect(screen.getByText('ABC12345')).toBeInTheDocument();
    });

    it('should display failure message', async () => {
        const { BookingFailure } = await import('@/components/booking/booking-failure');

        render(<BookingFailure errorMessage="Your card was declined" />);

        expect(screen.getByText('Payment Failed')).toBeInTheDocument();
        expect(screen.getByText('Your card was declined')).toBeInTheDocument();
    });

    it('should navigate back on Try Again click', async () => {
        const { BookingFailure } = await import('@/components/booking/booking-failure');

        render(<BookingFailure />);

        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        await user.click(tryAgainButton);

        expect(mockBack).toHaveBeenCalled();
    });
});

