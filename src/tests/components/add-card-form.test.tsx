import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddCardForm } from '@/components/settings/add-card-form';

describe('AddCardForm', () => {
    const defaultProps = {
        onSubmit: vi.fn().mockResolvedValue(undefined),
        onCancel: vi.fn(),
    };

    const getSubmitButton = () => screen.getByRole('button', { name: /add card/i });

    const submitForm = async () => {
        const form = getSubmitButton().closest('form');
        if (form) {
            fireEvent.submit(form);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    describe('rendering', () => {
        it('should render all form fields', () => {
            render(<AddCardForm {...defaultProps} />);

            expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/cvc/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument();
        });

        it('should render set as default checkbox', () => {
            render(<AddCardForm {...defaultProps} />);

            expect(screen.getByLabelText(/set as default/i)).toBeInTheDocument();
        });

        it('should render security indicator', () => {
            render(<AddCardForm {...defaultProps} />);

            expect(screen.getByText(/securely encrypted/i)).toBeInTheDocument();
        });

        it('should render Add Card button', () => {
            render(<AddCardForm {...defaultProps} />);

            expect(getSubmitButton()).toBeInTheDocument();
        });

        it('should render Cancel button when onCancel is provided', () => {
            render(<AddCardForm {...defaultProps} />);

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
    });

    describe('card number formatting', () => {
        it('should format card number with spaces', async () => {
            const user = userEvent.setup();
            render(<AddCardForm {...defaultProps} />);

            const input = screen.getByLabelText(/card number/i);
            await user.type(input, '4242424242424242');

            expect(input).toHaveValue('4242 4242 4242 4242');
        });
    });

    describe('validation', () => {
        it('should show error when card number is too short', async () => {
            const user = userEvent.setup();
            render(<AddCardForm {...defaultProps} />);

            await user.type(screen.getByLabelText(/card number/i), '1234');
            await user.type(screen.getByLabelText(/cardholder name/i), 'John');
            await user.type(screen.getByLabelText(/month/i), '12');
            await user.type(screen.getByLabelText(/year/i), '27');
            await user.type(screen.getByLabelText(/cvc/i), '123');

            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/card number must be 16 digits/i)).toBeInTheDocument();
            });
        });

        it('should show error when CVC is too short', async () => {
            const user = userEvent.setup();
            render(<AddCardForm {...defaultProps} />);

            await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
            await user.type(screen.getByLabelText(/cardholder name/i), 'John');
            await user.type(screen.getByLabelText(/month/i), '12');
            await user.type(screen.getByLabelText(/year/i), '27');
            await user.type(screen.getByLabelText(/cvc/i), '12');

            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/cvc must be 3-4 digits/i)).toBeInTheDocument();
            });
        });
    });

    describe('submission', () => {
        it('should call onSubmit with form data', async () => {
            const onSubmit = vi.fn().mockResolvedValue(undefined);
            const user = userEvent.setup();

            render(<AddCardForm onSubmit={onSubmit} onCancel={vi.fn()} />);

            await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
            await user.type(screen.getByLabelText(/month/i), '12');
            await user.type(screen.getByLabelText(/year/i), '27');
            await user.type(screen.getByLabelText(/cvc/i), '123');
            await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe');

            await submitForm();

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cardNumber: '4242 4242 4242 4242',
                        expiryMonth: '12',
                        expiryYear: '27',
                        cvc: '123',
                        cardholderName: 'John Doe',
                    })
                );
            }, { timeout: 3000 });
        });

        it('should call onCancel when Cancel is clicked', async () => {
            const onCancel = vi.fn();
            const user = userEvent.setup();

            render(<AddCardForm {...defaultProps} onCancel={onCancel} />);

            await user.click(screen.getByRole('button', { name: /cancel/i }));

            expect(onCancel).toHaveBeenCalled();
        });
    });
});
