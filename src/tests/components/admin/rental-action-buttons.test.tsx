'use client';

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { RentalActionButtons } from '@/components/admin/rental-detail/rental-action-buttons';
import { renderWithProviders } from '../../test-utils';
import type { AdminRentalStatus } from '@/types';

describe('RentalActionButtons', () => {
    const defaultProps = {
        status: 'PENDING' as AdminRentalStatus,
        onApprove: () => { },
        onReject: () => { },
        onPickup: () => { },
        onReturn: () => { },
        isLoading: false,
    };

    it('should render Approve and Reject buttons for PENDING status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="PENDING" />);

        expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    });

    it('should render Pickup button for CONFIRMED status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="CONFIRMED" />);

        expect(screen.getByRole('button', { name: /Process Pickup/i })).toBeInTheDocument();
    });

    it('should render Return button for ACTIVE status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="ACTIVE" />);

        expect(screen.getByRole('button', { name: /Process Return/i })).toBeInTheDocument();
    });

    it('should not render any action buttons for COMPLETED status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="COMPLETED" />);

        expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Process Pickup/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Process Return/i })).not.toBeInTheDocument();
    });

    it('should not render any action buttons for CANCELLED status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="CANCELLED" />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render any action buttons for REJECTED status', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="REJECTED" />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should disable buttons when isLoading is true', () => {
        renderWithProviders(<RentalActionButtons {...defaultProps} status="PENDING" isLoading={true} />);

        expect(screen.getByRole('button', { name: /Approve/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Reject/i })).toBeDisabled();
    });
});

