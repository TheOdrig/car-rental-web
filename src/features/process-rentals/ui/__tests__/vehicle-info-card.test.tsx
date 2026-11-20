'use client';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { VehicleInfoCard } from '@/features/process-rentals';
import { renderWithProviders } from '@/app/testing/test-utils';
import type { RentalVehicleInfo } from '@/entities/rental';
import { CAR_SERVICE_STATUS_LABELS, type CarStatus } from '@/entities/car';
describe('VehicleInfoCard', () => {
    const mockVehicle: RentalVehicleInfo = {
        id: 101,
        brand: 'Tesla',
        model: 'Model 3',
        licensePlate: 'ABC-1234',
        year: 2023,
        imageUrl: '/cars/tesla-model-3.jpg',
        status: 'MAINTENANCE',
        fuelType: 'Electric',
        transmissionType: 'Automatic',
    };
    it('should render vehicle brand and model', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    });
    it('should render license plate', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    });
    it('should render vehicle status badge', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
    it('should render fuel type', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        expect(screen.getByText('Electric')).toBeInTheDocument();
    });
    it('should render transmission type', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        expect(screen.getByText('Automatic')).toBeInTheDocument();
    });
    it('should render link to vehicle detail page', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        const viewDetailsLink = screen.getByRole('link', { name: /View Details/i });
        expect(viewDetailsLink).toHaveAttribute('href', '/admin/fleet/101');
    });
    it('should render vehicle image when provided', () => {
        renderWithProviders(<VehicleInfoCard vehicle={mockVehicle} />);
        const image = screen.getByRole('img', { name: /Tesla Model 3/i });
        expect(image).toBeInTheDocument();
    });
    it('should handle different vehicle statuses', () => {
        const statuses = ['AVAILABLE', 'MAINTENANCE', 'DAMAGED', 'INSPECTION'];
        statuses.forEach(status => {
            const vehicleWithStatus = { ...mockVehicle, status: status as RentalVehicleInfo['status'] };
            const { unmount } = renderWithProviders(<VehicleInfoCard vehicle={vehicleWithStatus} />);
            expect(screen.getByText(CAR_SERVICE_STATUS_LABELS[status as CarStatus])).toBeInTheDocument();
            unmount();
        });
    });
});