'use client';

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { RentalInfoCard } from '@/components/admin/rental-detail/rental-info-card';
import { renderWithProviders } from '../../test-utils';
import type { AdminRentalStatus, RentalPricing } from '@/types';

describe('RentalInfoCard', () => {
    const defaultProps = {
        rentalId: 12345,
        status: 'CONFIRMED' as AdminRentalStatus,
        createdAt: '2025-01-15T10:00:00Z',
        startDate: '2025-01-20T10:00:00Z',
        endDate: '2025-01-25T10:00:00Z',
        duration: 5,
    };

    const mockPricing: RentalPricing = {
        dailyRate: 100,
        totalDays: 5,
        subtotal: 500,
        discounts: 50,
        finalTotal: 450,
        currency: 'USD',
    };

    it('should render rental reference number', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} />);

        expect(screen.getByText('CR-012345')).toBeInTheDocument();
    });

    it('should render status badge', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} />);

        expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('should render duration in days', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} />);

        expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('should render start and end dates', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} />);

        expect(screen.getByText('Start Date')).toBeInTheDocument();
        expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('should render pricing breakdown when provided', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} pricing={mockPricing} />);

        expect(screen.getByText('Daily Rate')).toBeInTheDocument();
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
        expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render discount when greater than zero', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} pricing={mockPricing} />);

        expect(screen.getByText('Discount')).toBeInTheDocument();
    });

    it('should not render pricing section when not provided', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} />);

        expect(screen.queryByText('Daily Rate')).not.toBeInTheDocument();
    });

    it('should render notes when provided', () => {
        renderWithProviders(<RentalInfoCard {...defaultProps} notes="VIP customer" />);

        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('VIP customer')).toBeInTheDocument();
    });

    it('should render different status variants correctly', () => {
        const statuses: AdminRentalStatus[] = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED'];

        statuses.forEach(status => {
            const { unmount } = renderWithProviders(
                <RentalInfoCard {...defaultProps} status={status} />
            );
            unmount();
        });
    });

    it('should render pickup and dropoff locations when provided', () => {
        renderWithProviders(
            <RentalInfoCard
                {...defaultProps}
                pickupLocation="Airport Terminal A"
                dropoffLocation="Downtown Office"
            />
        );

        expect(screen.getByText('Pickup')).toBeInTheDocument();
        expect(screen.getByText('Airport Terminal A')).toBeInTheDocument();
        expect(screen.getByText('Drop-off')).toBeInTheDocument();
        expect(screen.getByText('Downtown Office')).toBeInTheDocument();
    });
});
