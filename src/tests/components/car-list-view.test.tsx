import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CarListView, CarListItem, CarListViewSkeleton } from '@/components/cars/car-list-view';
import type { Car } from '@/types';

const mockCar: Car = {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    productionYear: 2023,
    licensePlate: 'ABC-123',
    bodyType: 'Sedan',
    fuelType: 'Gasoline',
    transmissionType: 'Automatic',
    seats: 5,
    color: 'White',
    kilometer: 15000,
    imageUrl: 'https://example.com/car.jpg',
    thumbnailUrl: 'https://example.com/car-thumb.jpg',
    price: 75,
    currencyType: 'USD',
    carStatusType: 'Available',
    rating: 4.5,
};

const mockCars: Car[] = [
    mockCar,
    {
        ...mockCar,
        id: 2,
        brand: 'Honda',
        model: 'Civic',
        productionYear: 2022,
        bodyType: 'Hatchback',
        fuelType: 'Hybrid',
        transmissionType: 'Manual',
        seats: 4,
        price: 60,
        rating: 4.2,
    },
];

describe('CarListItem', () => {
    it('should render car brand and model', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('should render car year', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('should render car price with currency', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('$75')).toBeInTheDocument();
        expect(screen.getByText('/day')).toBeInTheDocument();
    });

    it('should render car specifications', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('Automatic')).toBeInTheDocument();
        expect(screen.getByText('Gasoline')).toBeInTheDocument();
        expect(screen.getByText('5 seats')).toBeInTheDocument();
    });

    it('should render body type badge', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('Sedan')).toBeInTheDocument();
    });

    it('should render rating when available', () => {
        render(<CarListItem car={mockCar} />);

        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should render View Details link', () => {
        render(<CarListItem car={mockCar} />);

        const link = screen.getByRole('link', { name: 'View Details' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/cars/1');
    });

    it('should apply custom className', () => {
        const { container } = render(<CarListItem car={mockCar} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });
});

describe('CarListView', () => {
    it('should render list of car items', () => {
        render(<CarListView cars={mockCars} />);

        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
        expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('should render empty message when no cars', () => {
        render(<CarListView cars={[]} />);

        expect(screen.getByText('No cars found matching your criteria.')).toBeInTheDocument();
    });

    it('should render correct number of items', () => {
        render(<CarListView cars={mockCars} />);

        const viewDetailsLinks = screen.getAllByRole('link', { name: 'View Details' });
        expect(viewDetailsLinks).toHaveLength(2);
    });

    it('should apply custom className', () => {
        const { container } = render(<CarListView cars={mockCars} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });
});

describe('CarListViewSkeleton', () => {
    it('should render default 4 skeleton items', () => {
        const { container } = render(<CarListViewSkeleton />);

        const skeletonCards = container.querySelectorAll('.overflow-hidden');
        expect(skeletonCards.length).toBe(4);
    });

    it('should render specified number of skeleton items', () => {
        const { container } = render(<CarListViewSkeleton count={2} />);

        const skeletonCards = container.querySelectorAll('.overflow-hidden');
        expect(skeletonCards.length).toBe(2);
    });
});

