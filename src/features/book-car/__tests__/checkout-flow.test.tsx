
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyProvider } from '@/entities/currency';
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
vi.mock('@/shared/ui/dynamic-image', () => ({
    DynamicImage: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
        <img src={src} alt={alt} className={className} />
    ),
}));
vi.mock('@/entities/car', () => ({
    useCar: vi.fn(() => ({
        data: {
            id: 1,
            brand: 'BMW',
            model: '3 Series',
            price: 100,
            currencyType: 'USD',
            imageUrl: '/car.jpg',
            productionYear: 2023,
            transmissionType: 'Automatic',
            fuelType: 'Petrol',
            seats: 5,
        },
        isLoading: false,
        error: null,
    })),
    usePricingPreview: vi.fn(() => ({
        data: {
            basePrice: 100,
            baseTotalPrice: 300,
            finalPrice: 300,
            effectiveDailyPrice: 100,
            totalSavings: 0,
            combinedMultiplier: 1,
            rentalDays: 3,
            appliedModifiers: [],
        },
        isLoading: false,
    })),
    pricingKeys: {
        preview: (carId: number, start: string, end: string) => ['pricing', 'preview', carId, start, end],
    },
}));
vi.mock('@/features/auth', async () => {
    const actual = await vi.importActual('@/features/auth');
    return {
        ...actual,
        useAuth: vi.fn(() => ({
            user: null,
        })),
    };
});
import { CheckoutForm } from '@/features/book-car';
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
        });
        it('should render booking summary with car info', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('BMW 3 Series')).toBeInTheDocument();
        });
        it('should render Request Booking button', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByRole('button', { name: /request booking/i })).toBeInTheDocument();
        });
    });
    describe('Price from the API', () => {
        it('should show the rental days and total from the pricing preview', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText(/Car Rental/)).toHaveTextContent(/3 days/);
            expect(screen.getAllByText(/300/).length).toBeGreaterThan(0);
        });
        it('should not add taxes and fees on the client', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.queryByText(/taxes/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/336/)).not.toBeInTheDocument();
        });
    });
    describe('No fake payment', () => {
        it('should not render any card fields or extras', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/cvc/i)).not.toBeInTheDocument();
            expect(screen.queryByText('Payment Method')).not.toBeInTheDocument();
            expect(screen.queryByText('Protection & Extras')).not.toBeInTheDocument();
        });
        it('should explain that payment happens after confirmation', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText(/pay after confirmation/i)).toBeInTheDocument();
        });
    });
});
describe('Success/Failure Pages', () => {
    const user = userEvent.setup();
    beforeEach(() => {
        mockBack.mockClear();
    });
    it('should display success confirmation', async () => {
        const { BookingSuccess } = await import('@/features/book-car');
        render(<BookingSuccess referenceNumber="ABC12345" />);
        expect(screen.getByText('Booking Requested!')).toBeInTheDocument();
        expect(screen.getByText('ABC12345')).toBeInTheDocument();
    });
    it('should display failure message', async () => {
        const { BookingFailure } = await import('@/features/book-car');
        render(<BookingFailure errorMessage="Your card was declined" />);
        expect(screen.getByText('Booking Failed')).toBeInTheDocument();
        expect(screen.getByText('Your card was declined')).toBeInTheDocument();
    });
    it('should navigate back on Try Again click', async () => {
        const { BookingFailure } = await import('@/features/book-car');
        render(<BookingFailure />);
        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        await user.click(tryAgainButton);
        expect(mockBack).toHaveBeenCalled();
    });
});