import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { RejectReasonDialog } from '@/features/process-rentals';
import { renderWithProviders } from '@/app/testing/test-utils';

function renderDialog(props: Partial<Parameters<typeof RejectReasonDialog>[0]> = {}) {
    return renderWithProviders(
        <RejectReasonDialog
            open
            onOpenChange={vi.fn()}
            reason="Vehicle unavailable"
            onReasonChange={vi.fn()}
            onConfirm={vi.fn()}
            isPending={false}
            {...props}
        />,
    );
}

describe('RejectReasonDialog copy', () => {
    it('says it rejects the request, not that it cancels a rental', () => {
        renderDialog();
        expect(screen.getByRole('heading', { name: 'Reject Rental Request' })).toBeInTheDocument();
        expect(screen.getByText(/rejecting this rental request/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm Rejection' })).toBeEnabled();
        expect(screen.queryByText(/Cancel Rental/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Confirm Cancel/)).not.toBeInTheDocument();
    });

    it('shows the pending label and disables confirm while rejecting', () => {
        renderDialog({ isPending: true });
        expect(screen.getByRole('button', { name: 'Rejecting...' })).toBeDisabled();
    });

    it('disables confirm without a reason', () => {
        renderDialog({ reason: '  ' });
        expect(screen.getByRole('button', { name: 'Confirm Rejection' })).toBeDisabled();
    });
});
