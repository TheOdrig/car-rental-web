import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarCard, CarCardSkeleton } from '@/components/cars/car-card';
import { renderWithProviders } from '../test-utils';
import { createMockCar, resetMockFactories } from '../factories';
import type { AvailableCar } from '@/types';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: { src: string; alt: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...props} />
    ),
}));

describe('CarCard', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        resetMockFactories();
    });

    describe('Rendering', () => {
        it('should render car brand and model', () => {
            const car = createMockCar({ brand: 'Toyota', model: 'Corolla' });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText(/toyota corolla/i)).toBeInTheDocument();
        });

        it('should render production year', () => {
            const car = createMockCar({ productionYear: 2024 });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText('2024')).toBeInTheDocument();
        });

        it('should render price with currency', () => {
            const car = createMockCar({ price: 150, currencyType: 'USD' });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText('$150')).toBeInTheDocument();
        });

        it('should render fuel type when provided', () => {
            const car = createMockCar({ fuelType: 'GASOLINE' });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText('GASOLINE')).toBeInTheDocument();
        });

        it('should render transmission when provided', () => {
            const car = createMockCar({ transmissionType: 'AUTOMATIC' });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText('AUTOMATIC')).toBeInTheDocument();
        });

        it('should render seats when provided', () => {
            const car = createMockCar({ seats: 5 });
            renderWithProviders(<CarCard car={car} />);

            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible image with descriptive alt text', () => {
            const car = createMockCar({
                brand: 'Honda',
                model: 'Civic',
                productionYear: 2023
            });
            renderWithProviders(<CarCard car={car} />);

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('alt', 'Honda Civic 2023 - Car available for rent');
        });

        it('should use placeholder image when imageUrl is not provided', () => {
            const car = createMockCar({ imageUrl: undefined });
            renderWithProviders(<CarCard car={car} />);

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('src', '/images/car-placeholder.svg');
        });
    });

    describe('Click Handler', () => {
        it('should call onSelect when card is clicked', async () => {
            const car = createMockCar();
            const onSelect = vi.fn();
            renderWithProviders(<CarCard car={car} onSelect={onSelect} />);

            await user.click(screen.getByText(/toyota corolla/i));

            expect(onSelect).toHaveBeenCalledWith(car);
        });

        it('should render as link when onSelect is not provided', () => {
            const car = createMockCar();
            renderWithProviders(<CarCard car={car} />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', `/cars/${car.id}`);
        });
    });

    describe('Status Badge', () => {
        it('should show status badge when showStatus is true', () => {
            const car = createMockCar({ carStatusType: 'Available' });
            renderWithProviders(<CarCard car={car} showStatus={true} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should not show status badge when showStatus is false', () => {
            const car = createMockCar({ carStatusType: 'Available' });
            renderWithProviders(<CarCard car={car} showStatus={false} />);

            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });
    });

    describe('AvailableCar Variant', () => {
        it('should render daily rate for search results', () => {
            const availableCar: AvailableCar = {
                id: 1,
                brand: 'BMW',
                model: 'X5',
                productionYear: 2024,
                dailyRate: 200,
                totalPrice: 600,
                currency: 'USD',
            };
            renderWithProviders(<CarCard car={availableCar} />);

            expect(screen.getByText('$200')).toBeInTheDocument();
            expect(screen.getByText('/day')).toBeInTheDocument();
        });

        it('should render total price for search results', () => {
            const availableCar: AvailableCar = {
                id: 1,
                brand: 'BMW',
                model: 'X5',
                productionYear: 2024,
                dailyRate: 200,
                totalPrice: 600,
                currency: 'USD',
            };
            renderWithProviders(<CarCard car={availableCar} />);

            expect(screen.getByText('$600')).toBeInTheDocument();
            expect(screen.getByText(/total/i)).toBeInTheDocument();
        });

        it('should show applied discounts badge', () => {
            const availableCar: AvailableCar = {
                id: 1,
                brand: 'BMW',
                model: 'X5',
                productionYear: 2024,
                dailyRate: 200,
                totalPrice: 600,
                currency: 'USD',
                appliedDiscounts: ['20% Off'],
            };
            renderWithProviders(<CarCard car={availableCar} />);

            expect(screen.getByText('20% Off')).toBeInTheDocument();
        });
    });
});

describe('CarCardSkeleton', () => {
    it('should render without error', () => {
        const { container } = renderWithProviders(<CarCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept compact variant without error', () => {
        const { container } = renderWithProviders(<CarCardSkeleton variant="compact" />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
