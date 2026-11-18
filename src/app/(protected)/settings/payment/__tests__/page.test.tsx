import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentMethodsPage from '../page';

describe('settings payment page', () => {
    it('explains that Stripe stores cards and shows no mock cards', () => {
        render(<PaymentMethodsPage />);

        expect(screen.getByTestId('payment-methods-explainer')).toHaveTextContent(
            'Cards are saved securely by Stripe when you pay for a rental.'
        );
        expect(screen.queryByText(/4242/)).not.toBeInTheDocument();
        expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /add card/i })).not.toBeInTheDocument();
    });

    it('links to the rentals list', () => {
        render(<PaymentMethodsPage />);

        expect(screen.getByRole('link', { name: 'Go to my rentals' })).toHaveAttribute('href', '/rentals');
    });
});
