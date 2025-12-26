import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonalDetailsForm } from '@/components/settings/personal-details-form';

describe('PersonalDetailsForm', () => {
    const defaultProps = {
        initialData: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
        },
        email: 'john@example.com',
        emailVerified: true,
        onSubmit: vi.fn(),
    };

    describe('rendering', () => {
        it('should render all form fields', () => {
            render(<PersonalDetailsForm {...defaultProps} />);

            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        it('should render address fields', () => {
            render(<PersonalDetailsForm {...defaultProps} />);

            expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zip/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
        });

        it('should display initial values', () => {
            render(<PersonalDetailsForm {...defaultProps} />);

            expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
            expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
            expect(screen.getByLabelText(/phone number/i)).toHaveValue('1234567890');
        });

        it('should display email as read-only', () => {
            render(<PersonalDetailsForm {...defaultProps} />);

            const emailInput = screen.getByLabelText(/email/i);
            expect(emailInput).toBeDisabled();
            expect(emailInput).toHaveValue('john@example.com');
        });

        it('should show verified badge when email is verified', () => {
            render(<PersonalDetailsForm {...defaultProps} emailVerified={true} />);

            expect(screen.getByText(/verified/i)).toBeInTheDocument();
        });

        it('should not show verified badge when email is not verified', () => {
            render(<PersonalDetailsForm {...defaultProps} emailVerified={false} />);

            expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
        });
    });

    describe('validation', () => {
        it('should show error when first name is empty', async () => {
            const user = userEvent.setup();
            render(<PersonalDetailsForm initialData={{}} onSubmit={vi.fn()} />);

            // Type something in other fields to enable submit
            await user.type(screen.getByLabelText(/last name/i), 'Doe');
            await user.type(screen.getByLabelText(/phone number/i), '1234567890');
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
        });

        it('should show error when phone is too short', async () => {
            const user = userEvent.setup();
            render(<PersonalDetailsForm {...defaultProps} initialData={{}} />);

            await user.type(screen.getByLabelText(/first name/i), 'John');
            await user.type(screen.getByLabelText(/last name/i), 'Doe');
            await user.type(screen.getByLabelText(/phone number/i), '123');
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            expect(await screen.findByText(/phone must be at least 10 digits/i)).toBeInTheDocument();
        });
    });

    describe('submission', () => {
        it('should call onSubmit with form data', async () => {
            const onSubmit = vi.fn().mockResolvedValue(undefined);
            const user = userEvent.setup();

            render(
                <PersonalDetailsForm
                    initialData={{ firstName: '', lastName: '', phone: '' }}
                    onSubmit={onSubmit}
                />
            );

            await user.type(screen.getByLabelText(/first name/i), 'Jane');
            await user.type(screen.getByLabelText(/last name/i), 'Smith');
            await user.type(screen.getByLabelText(/phone number/i), '9876543210');
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            await vi.waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        firstName: 'Jane',
                        lastName: 'Smith',
                        phone: '9876543210',
                    })
                );
            });
        });

        it('should disable submit button when form is not dirty', () => {
            render(<PersonalDetailsForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /save changes/i });
            expect(submitButton).toBeDisabled();
        });
    });
});
