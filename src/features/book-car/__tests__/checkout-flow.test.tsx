import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyProvider } from '@/entities/currency';
import { rentalKeys } from '@/entities/rental';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockPost = vi.fn();
const mockCar = vi.hoisted(() => ({
    value: {
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
        carStatusType: 'AVAILABLE',
    } as Record<string, unknown>,
}));
const mockBooked = vi.hoisted(() => ({ value: { booked: new Set<string>(), blockedReason: null as string | null } }));
const mockPricing = vi.hoisted(() => ({
    value: {
        data: {
            basePrice: 100,
            baseTotalPrice: 300,
            finalPrice: 300,
            effectiveDailyPrice: 100,
            totalSavings: 0,
            combinedMultiplier: 1,
            rentalDays: 3,
            appliedModifiers: [] as unknown[],
        } as unknown,
        isLoading: false,
        isError: false,
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: mockPush,
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
vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api');
    return {
        ...actual,
        clientPost: (...args: unknown[]) => mockPost(...args),
    };
});
vi.mock('@/entities/car', () => ({
    isAvailable: (car: { carStatusType?: string }) => car.carStatusType === 'AVAILABLE',
    getCarUnavailableMessage: () => 'This car is in maintenance and cannot be booked right now.',
    useCar: vi.fn(() => ({
        data: { car: mockCar.value },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    })),
    usePricingPreview: vi.fn(() => mockPricing.value),
    useBookedDates: vi.fn(() => mockBooked.value),
    pricingKeys: {
        preview: (carId: number, start: string, end: string) => ['pricing', 'preview', carId, start, end],
    },
}));

import { CheckoutForm, BookingSuccess } from '@/features/book-car';
import React from 'react';

function renderWithProviders(component: React.ReactElement, queryClient?: QueryClient) {
    const client =
        queryClient ??
        new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    return render(
        <QueryClientProvider client={client}>
            <CurrencyProvider>{component}</CurrencyProvider>
        </QueryClientProvider>
    );
}

function submitRequest() {
    fireEvent.submit(screen.getByRole('button', { name: /request rental/i }).closest('form')!);
}

const defaultProps = {
    carId: '1',
    startDate: '2024-01-15',
    endDate: '2024-01-18',
};

describe('Checkout Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPost.mockResolvedValue({ id: 42 });
        mockBooked.value = { booked: new Set<string>(), blockedReason: null };
        mockCar.value = {
            id: 1,
            brand: 'BMW',
            model: '3 Series',
            price: 100,
            currencyType: 'USD',
            imageUrl: '/car.jpg',
            productionYear: 2023,
            transmissionType: 'Automatic',
            fuelType: 'Petrol',
            carStatusType: 'AVAILABLE',
            seats: 5,
        };
        mockPricing.value = {
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
            isError: false,
        };
    });

    afterEach(() => {
        localStorage.removeItem('preferred_currency');
    });

    describe('Form Rendering', () => {
        it('should explain the request flow instead of collecting personal details', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('How this works')).toBeInTheDocument();
            expect(screen.getByText(/An administrator reviews it/)).toBeInTheDocument();
            expect(screen.queryByText('Personal Details')).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
        });

        it('should render booking summary with car info', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('BMW 3 Series')).toBeInTheDocument();
        });

        it('should not invent pickup or drop-off locations', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.queryByText('Main Office')).not.toBeInTheDocument();
            expect(screen.queryByText(/pick-up/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/drop-off/i)).not.toBeInTheDocument();
        });

        it('should show the requested dates without a shifted day', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
            expect(screen.getByText('Jan 18, 2024')).toBeInTheDocument();
        });

        it('should render a single Request Rental button', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getAllByRole('button', { name: /request rental/i })).toHaveLength(1);
            expect(screen.queryByRole('button', { name: /pay now|proceed to payment/i })).not.toBeInTheDocument();
        });
    });

    describe('Price from the API', () => {
        it('should show the rental days and total from the pricing preview', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText(/Car Rental/)).toHaveTextContent(/3 days/);
            expect(screen.getAllByText(/300/).length).toBeGreaterThan(0);
        });

        it('should label the total as an estimate', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('Estimated total')).toBeInTheDocument();
            expect(screen.getByText(/Estimated, final price on review/)).toBeInTheDocument();
        });

        it('should not add taxes and fees on the client', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.queryByText(/taxes/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/336/)).not.toBeInTheDocument();
        });

        it('should list surcharges under price adjustments rather than discounts', () => {
            mockPricing.value = {
                ...mockPricing.value,
                data: {
                    ...(mockPricing.value.data as object),
                    appliedModifiers: [
                        {
                            strategyName: 'WEEKEND',
                            description: 'Weekend rate',
                            formattedPercentage: '+15%',
                            isDiscount: false,
                        },
                    ],
                },
            };
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText('Price adjustments')).toBeInTheDocument();
            expect(screen.queryByText(/discounts applied/i)).not.toBeInTheDocument();
            expect(screen.getByText('+15%')).toBeInTheDocument();
        });

        it('should say so when the pricing service is unavailable', () => {
            mockPricing.value = { data: undefined, isLoading: false, isError: true };
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText(/pricing service is unavailable/i)).toBeInTheDocument();
            expect(screen.getAllByText(/400/).length).toBeGreaterThan(0);
        });
    });

    describe('Currency honesty', () => {
        it('should show the charged amount in the car currency even when another currency is selected', async () => {
            mockCar.value = { ...mockCar.value, currencyType: 'TRY', price: 1500 };
            mockPricing.value = {
                ...mockPricing.value,
                data: {
                    basePrice: 1500,
                    baseTotalPrice: 4500,
                    finalPrice: 4500,
                    effectiveDailyPrice: 1500,
                    totalSavings: 0,
                    combinedMultiplier: 1,
                    rentalDays: 3,
                    appliedModifiers: [],
                },
            };
            localStorage.setItem('preferred_currency', 'EUR');
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(await screen.findByText(/Charged in TRY/)).toBeInTheDocument();
            expect(screen.getAllByText(/₺/).length).toBeGreaterThan(0);
            expect(await screen.findByText(/approximate rate/)).toBeInTheDocument();
            expect(screen.queryByText(/^€4,500/)).not.toBeInTheDocument();
        });
    });

    describe('Availability before submitting', () => {
        it('should show the conflict and block the request when a day in the range is booked', () => {
            mockBooked.value = { booked: new Set(['2024-01-16']), blockedReason: null };

            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByRole('alert')).toHaveTextContent(/no longer available for the selected dates/i);
            expect(screen.getByRole('button', { name: /request rental/i })).toBeDisabled();
        });

        it('should ignore booked days outside the requested range', () => {
            mockBooked.value = { booked: new Set(['2024-01-25']), blockedReason: null };

            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /request rental/i })).toBeEnabled();
        });
    });

    describe('Submitting the request', () => {
        it('should send only the fields the API accepts and go to the success page', async () => {
            const queryClient = new QueryClient({
                defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
            });
            const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
            renderWithProviders(<CheckoutForm {...defaultProps} />, queryClient);

            submitRequest();

            await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
            expect(mockPost).toHaveBeenCalledWith('/api/rentals', {
                carId: 1,
                startDate: '2024-01-15',
                endDate: '2024-01-18',
            });
            await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/booking/success?ref=42'));
            expect(invalidate).toHaveBeenCalledWith({ queryKey: rentalKeys.all });
        });

        it('should send the optional note as notes', async () => {
            const user = userEvent.setup();
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            await user.type(screen.getByLabelText('Optional'), '  Late arrival  ');
            submitRequest();

            await waitFor(() => expect(mockPost).toHaveBeenCalled());
            expect(mockPost).toHaveBeenCalledWith('/api/rentals', {
                carId: 1,
                startDate: '2024-01-15',
                endDate: '2024-01-18',
                notes: 'Late arrival',
            });
        });

        it('should not submit twice on a double click', async () => {
            mockPost.mockImplementation(() => new Promise(() => undefined));
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            submitRequest();
            submitRequest();

            await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
            expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
        });

        it('should block the request for a car in maintenance', () => {
            mockCar.value = { ...mockCar.value, carStatusType: 'MAINTENANCE' };
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            expect(screen.getByRole('alert')).toHaveTextContent(/in maintenance/i);
            expect(screen.getByRole('button', { name: /request rental/i })).toBeDisabled();
            mockCar.value = { ...mockCar.value, carStatusType: 'AVAILABLE' };
        });

        it('should stay disabled after success while navigation is pending', async () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            submitRequest();
            await waitFor(() => expect(mockPush).toHaveBeenCalled());

            expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        it('should show the error and allow another try when the request fails', async () => {
            mockPost.mockRejectedValueOnce(new Error('Server exploded'));
            renderWithProviders(<CheckoutForm {...defaultProps} />);

            submitRequest();

            expect(await screen.findByRole('alert')).toBeInTheDocument();
            expect(mockPush).not.toHaveBeenCalled();
            await waitFor(() => expect(screen.getByRole('button', { name: /request rental/i })).toBeEnabled());

            submitRequest();
            await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(2));
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

        it('should explain that payment comes after approval', () => {
            renderWithProviders(<CheckoutForm {...defaultProps} />);
            expect(screen.getByText(/payment comes after approval, from your rental page/i)).toBeInTheDocument();
            expect(screen.getByText(/No payment now/i)).toBeInTheDocument();
        });
    });
});

describe('Success/Failure Pages', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockBack.mockClear();
    });

    it('should display success confirmation', () => {
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
        await user.click(screen.getByRole('button', { name: /try again/i }));
        expect(mockBack).toHaveBeenCalled();
    });
});
