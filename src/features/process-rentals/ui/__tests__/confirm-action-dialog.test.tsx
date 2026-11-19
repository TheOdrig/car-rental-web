import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';
import { ConfirmActionDialog } from '@/features/process-rentals';

function setup(isPending = false) {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderWithProviders(
        <ConfirmActionDialog
            open
            onOpenChange={onOpenChange}
            title="Return the vehicle early?"
            description="Unused days are refunded."
            confirmLabel="Return Early"
            isPending={isPending}
            onConfirm={onConfirm}
        />
    );
    return { onConfirm, onOpenChange };
}

describe('ConfirmActionDialog', () => {
    it('shows the consequence and confirms on request', async () => {
        const { onConfirm } = setup();

        expect(screen.getByText('Unused days are refunded.')).toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole('button', { name: 'Return Early' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('cannot be confirmed again while the request is pending', () => {
        setup(true);

        expect(screen.getByRole('button', { name: 'Working...' })).toBeDisabled();
    });

    it('renders extra content and blocks confirming while it is disabled', () => {
        renderWithProviders(
            <ConfirmActionDialog
                open
                onOpenChange={vi.fn()}
                title="Return the vehicle early?"
                description="Unused days are refunded."
                confirmLabel="Return Early"
                confirmDisabled
                onConfirm={vi.fn()}
            >
                <p>Refund preview</p>
            </ConfirmActionDialog>
        );

        expect(screen.getByText('Refund preview')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Return Early' })).toBeDisabled();
    });
});
