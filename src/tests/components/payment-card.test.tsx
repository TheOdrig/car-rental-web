import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentCard } from '@/components/settings/payment-card';
import type { PaymentMethod } from '@/types/payment';

const mockCard: PaymentMethod = {
    id: '1',
    cardType: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    cardholderName: 'John Doe',
    isDefault: false,
    createdAt: '2024-01-15',
};

describe('PaymentCard', () => {
    describe('rendering', () => {
        it('should display card type and last 4 digits', () => {
            render(<PaymentCard method={mockCard} />);

            expect(screen.getByText(/visa.*4242/i)).toBeInTheDocument();
        });

        it('should display expiry date', () => {
            render(<PaymentCard method={mockCard} />);

            expect(screen.getByText(/expires 12\/27/i)).toBeInTheDocument();
        });

        it('should show default badge when card is default', () => {
            render(<PaymentCard method={{ ...mockCard, isDefault: true }} />);

            expect(screen.getByText(/default/i)).toBeInTheDocument();
        });

        it('should not show default badge when card is not default', () => {
            render(<PaymentCard method={{ ...mockCard, isDefault: false }} />);

            expect(screen.queryByText(/default/i)).not.toBeInTheDocument();
        });

        it('should apply highlighted styling when card is default', () => {
            const { container } = render(
                <PaymentCard method={{ ...mockCard, isDefault: true }} />
            );

            expect(container.firstChild).toHaveClass('border-primary');
        });
    });

    describe('card type colors', () => {
        it.each([
            ['visa', 'text-blue-600'],
            ['mastercard', 'text-orange-500'],
        ] as const)('should display correct color for %s', (cardType, expectedClass) => {
            const { container } = render(
                <PaymentCard method={{ ...mockCard, cardType }} />
            );

            const iconContainer = container.querySelector('.rounded-lg.bg-muted');
            expect(iconContainer).toHaveClass(expectedClass);
        });
    });

    describe('actions', () => {
        it('should call onSetDefault when Set as default is clicked', async () => {
            const onSetDefault = vi.fn();
            const user = userEvent.setup();

            render(
                <PaymentCard
                    method={mockCard}
                    onSetDefault={onSetDefault}
                />
            );

            await user.click(screen.getByRole('button'));
            await user.click(screen.getByText(/set as default/i));

            expect(onSetDefault).toHaveBeenCalledWith('1');
        });

        it('should call onDelete when Delete is clicked', async () => {
            const onDelete = vi.fn();
            const user = userEvent.setup();

            render(
                <PaymentCard
                    method={mockCard}
                    onDelete={onDelete}
                />
            );

            await user.click(screen.getByRole('button'));
            await user.click(screen.getByText(/delete card/i));

            expect(onDelete).toHaveBeenCalledWith('1');
        });

        it('should not show Set as default option for default card', async () => {
            const user = userEvent.setup();

            render(
                <PaymentCard
                    method={{ ...mockCard, isDefault: true }}
                    onSetDefault={vi.fn()}
                />
            );

            await user.click(screen.getByRole('button'));

            expect(screen.queryByText(/set as default/i)).not.toBeInTheDocument();
        });
    });
});
