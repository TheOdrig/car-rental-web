'use client';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { RentalActionButtons } from '@/features/process-rentals';
import { renderWithProviders } from '@/app/testing/test-utils';
import type { AdminRentalStatus } from '@/entities/rental';
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
});describe('RentalActionButtons early return and cancel', () => {
    const noop = () => { };

    it('offers Return Early for an ACTIVE rental and calls its handler', async () => {
        const onEarlyReturn = vi.fn();
        renderWithProviders(<RentalActionButtons status="ACTIVE" onReturn={noop} onEarlyReturn={onEarlyReturn} />);

        await userEvent.setup().click(screen.getByRole('button', { name: /Return Early/i }));

        expect(onEarlyReturn).toHaveBeenCalledTimes(1);
    });

    it('runs the cancel handler for a CONFIRMED rental instead of doing nothing', async () => {
        const onCancel = vi.fn();
        renderWithProviders(<RentalActionButtons status="CONFIRMED" onPickup={noop} onCancel={onCancel} />);

        await userEvent.setup().click(screen.getByRole('button', { name: /^Cancel$/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables an action that has no handler', () => {
        renderWithProviders(<RentalActionButtons status="CONFIRMED" onPickup={noop} />);

        expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeDisabled();
    });
});
