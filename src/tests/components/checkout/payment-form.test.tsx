import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentForm } from '@/components/checkout/payment-form';
import { checkoutFormSchema, type CheckoutFormSchema } from '@/lib/validations/checkout';

function PaymentFormTestWrapper({
    defaultValues = {},
}: {
    defaultValues?: Partial<CheckoutFormSchema>;
}) {
    const methods = useForm<CheckoutFormSchema>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '1234567890',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            cardholderName: '',
            addons: [],
            ...defaultValues,
        },
        mode: 'onChange',
    });

    return (
        <FormProvider {...methods}>
            <PaymentForm control={methods.control} errors={methods.formState.errors} />
        </FormProvider>
    );
}

describe('PaymentForm', () => {
    const user = userEvent.setup();

    it('should render all form fields', () => {
        render(<PaymentFormTestWrapper />);

        expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cvc/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument();
    });

    it('should display section header', () => {
        render(<PaymentFormTestWrapper />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should format card number with spaces', async () => {
        render(<PaymentFormTestWrapper />);

        const cardInput = screen.getByLabelText(/card number/i);
        await user.type(cardInput, '4111111111111111');

        expect(cardInput).toHaveValue('4111 1111 1111 1111');
    });

    it('should format expiry date as MM/YY', async () => {
        render(<PaymentFormTestWrapper />);

        const expiryInput = screen.getByLabelText(/expiry date/i);
        await user.type(expiryInput, '1225');

        expect(expiryInput).toHaveValue('12/25');
    });

    it('should limit CVC to 3 digits by default', async () => {
        render(<PaymentFormTestWrapper />);

        const cvcInput = screen.getByLabelText(/cvc/i);
        await user.type(cvcInput, '123456');

        expect(cvcInput).toHaveValue('123');
    });

    it('should have numeric input mode for card fields', () => {
        render(<PaymentFormTestWrapper />);

        expect(screen.getByLabelText(/card number/i)).toHaveAttribute('inputMode', 'numeric');
        expect(screen.getByLabelText(/expiry date/i)).toHaveAttribute('inputMode', 'numeric');
        expect(screen.getByLabelText(/cvc/i)).toHaveAttribute('inputMode', 'numeric');
    });

    it('should have autocomplete attributes', () => {
        render(<PaymentFormTestWrapper />);

        expect(screen.getByLabelText(/card number/i)).toHaveAttribute('autocomplete', 'cc-number');
        expect(screen.getByLabelText(/expiry date/i)).toHaveAttribute('autocomplete', 'cc-exp');
        expect(screen.getByLabelText(/cvc/i)).toHaveAttribute('autocomplete', 'cc-csc');
        expect(screen.getByLabelText(/cardholder name/i)).toHaveAttribute('autocomplete', 'cc-name');
    });

    it('should pre-fill values from defaultValues', () => {
        render(
            <PaymentFormTestWrapper
                defaultValues={{
                    cardNumber: '4111 1111 1111 1111',
                    expiryDate: '12/25',
                    cvc: '123',
                    cardholderName: 'JOHN DOE',
                }}
            />
        );

        expect(screen.getByDisplayValue('4111 1111 1111 1111')).toBeInTheDocument();
        expect(screen.getByDisplayValue('12/25')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('JOHN DOE')).toBeInTheDocument();
    });

    it('should have CVC help tooltip', () => {
        render(<PaymentFormTestWrapper />);

        const cvcField = screen.getByLabelText(/cvc/i).closest('.relative');
        expect(cvcField?.querySelector('[class*="cursor-help"]')).toBeInTheDocument();
    });
});

