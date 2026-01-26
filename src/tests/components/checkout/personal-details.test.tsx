import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalDetails } from '@/components/checkout/personal-details';
import { checkoutFormSchema, type CheckoutFormSchema } from '@/lib/validations/checkout';

function PersonalDetailsTestWrapper({
    defaultValues = {},
    isLoggedIn = false,
}: {
    defaultValues?: Partial<CheckoutFormSchema>;
    isLoggedIn?: boolean;
}) {
    const methods = useForm<CheckoutFormSchema>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
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
            <PersonalDetails
                control={methods.control}
                errors={methods.formState.errors}
                isLoggedIn={isLoggedIn}
            />
        </FormProvider>
    );
}

describe('PersonalDetails', () => {
    const user = userEvent.setup();

    it('should render all form fields', () => {
        render(<PersonalDetailsTestWrapper />);

        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('should display section header with number', () => {
        render(<PersonalDetailsTestWrapper />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Personal Details')).toBeInTheDocument();
    });

    it('should show auto-filled indicator when logged in', () => {
        render(<PersonalDetailsTestWrapper isLoggedIn={true} />);

        expect(screen.getByText(/auto-filled from profile/i)).toBeInTheDocument();
    });

    it('should not show auto-filled indicator when not logged in', () => {
        render(<PersonalDetailsTestWrapper isLoggedIn={false} />);

        expect(screen.queryByText(/auto-filled from profile/i)).not.toBeInTheDocument();
    });

    it('should pre-fill values from defaultValues', () => {
        render(
            <PersonalDetailsTestWrapper
                defaultValues={{
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                }}
            />
        );

        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should allow typing in input fields', async () => {
        render(<PersonalDetailsTestWrapper />);

        const firstNameInput = screen.getByLabelText(/first name/i);
        await user.type(firstNameInput, 'Sarah');

        expect(firstNameInput).toHaveValue('Sarah');
    });

    it('should have proper input types', () => {
        render(<PersonalDetailsTestWrapper />);

        expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
        expect(screen.getByLabelText(/phone/i)).toHaveAttribute('type', 'tel');
    });

    it('should have email and phone icons', () => {
        render(<PersonalDetailsTestWrapper />);

        const emailField = screen.getByLabelText(/email/i).closest('.relative');
        const phoneField = screen.getByLabelText(/phone/i).closest('.relative');

        expect(emailField).toBeInTheDocument();
        expect(phoneField).toBeInTheDocument();
    });
});

