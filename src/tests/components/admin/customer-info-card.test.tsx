'use client';

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { CustomerInfoCard } from '@/components/admin/rental-detail/customer-info-card';
import { renderWithProviders } from '../../test-utils';
import type { RentalCustomerInfo } from '@/types';

describe('CustomerInfoCard', () => {
    const mockCustomer: RentalCustomerInfo = {
        id: 42,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        emailVerified: true,
        phoneVerified: false,
        avatarUrl: '/avatars/john.jpg',
        stats: {
            totalRentals: 15,
            totalSpent: 4500,
            damageCount: 1,
        },
    };

    it('should render customer name', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render customer email with mailto link', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        const emailLink = screen.getByRole('link', { name: /john.doe@example.com/i });
        expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
    });

    it('should render customer phone with tel link', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        const phoneLink = screen.getByRole('link', { name: /\+1234567890/i });
        expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890');
    });

    it('should render unverified badge when phone is not verified', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        expect(screen.getByText('Unverified')).toBeInTheDocument();
    });

    it('should render customer statistics', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Rentals')).toBeInTheDocument();
    });

    it('should render link to customer detail page', () => {
        renderWithProviders(<CustomerInfoCard customer={mockCustomer} />);

        const viewProfileLink = screen.getByRole('link', { name: /View Profile/i });
        expect(viewProfileLink).toHaveAttribute('href', '/admin/users/42');
    });

    it('should render avatar with fallback initials', () => {
        const customerWithoutAvatar = { ...mockCustomer, avatarUrl: undefined };
        renderWithProviders(<CustomerInfoCard customer={customerWithoutAvatar} />);

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle missing phone gracefully', () => {
        const { phone, ...customerWithoutPhone } = mockCustomer;
        renderWithProviders(<CustomerInfoCard customer={customerWithoutPhone as any} />);

        expect(screen.queryByRole('link', { name: /\+/i })).not.toBeInTheDocument();
    });
});
