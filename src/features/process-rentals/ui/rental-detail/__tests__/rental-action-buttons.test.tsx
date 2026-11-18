import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RentalActionButtons } from '../rental-action-buttons';

describe('RentalActionButtons pickup payment hint', () => {
    it('explains that pickup needs an authorized payment', () => {
        render(<RentalActionButtons status="CONFIRMED" onPickup={vi.fn()} />);

        expect(screen.getByTestId('pickup-payment-hint')).toHaveTextContent(/authorized/);
        expect(screen.getByRole('button', { name: /process pickup/i })).toBeEnabled();
    });

    it('disables pickup and shows the reason when the payment is not authorized', async () => {
        const onPickup = vi.fn();
        render(<RentalActionButtons status="CONFIRMED" onPickup={onPickup} pickupBlockedReason="Needs payment first" />);

        const button = screen.getByRole('button', { name: /process pickup/i });
        expect(button).toBeDisabled();
        expect(screen.getByTestId('pickup-payment-hint')).toHaveTextContent('Needs payment first');
        await userEvent.click(button);
        expect(onPickup).not.toHaveBeenCalled();
    });

    it('does not show the hint for other statuses', () => {
        render(<RentalActionButtons status="ACTIVE" onReturn={vi.fn()} />);

        expect(screen.queryByTestId('pickup-payment-hint')).not.toBeInTheDocument();
    });

    it('still lets cancel work while pickup is blocked', async () => {
        const onCancel = vi.fn();
        render(<RentalActionButtons status="CONFIRMED" onCancel={onCancel} pickupBlockedReason="x" />);

        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalled();
    });
});
