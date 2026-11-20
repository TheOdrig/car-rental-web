import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonalDetailsForm } from '@/features/user-settings';
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
    const getSubmitButton = () => screen.getByRole('button', { name: /save changes/i });
    const submitForm = async () => {
        const form = getSubmitButton().closest('form');
        if (form) {
            fireEvent.submit(form);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    };
    describe('rendering', () => {
        it('should render all form fields', () => {
            render(<PersonalDetailsForm {...defaultProps} />);
            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
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
            expect(screen.getByText('Verified')).toBeInTheDocument();
            expect(screen.queryByText('Not verified')).not.toBeInTheDocument();
        });
        it('should show a not verified badge when email is not verified', () => {
            render(<PersonalDetailsForm {...defaultProps} emailVerified={false} />);
            expect(screen.getByText('Not verified')).toBeInTheDocument();
            expect(screen.queryByText('Verified')).not.toBeInTheDocument();
        });
        it('should show no verification badge when the status is unknown', () => {
            render(<PersonalDetailsForm {...defaultProps} emailVerified={undefined} />);
            expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
        });
    });
    describe('validation', () => {
        it('should not require a first or last name', async () => {
            const onSubmit = vi.fn().mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<PersonalDetailsForm initialData={{ firstName: '', lastName: '', phone: '' }} email="t@t.com" onSubmit={onSubmit} />);
            await user.type(screen.getByLabelText(/phone number/i), '1234567890');
            await submitForm();
            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalled();
            });
            expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
        });
        it('should link the error of a too long name to its field', async () => {
            const user = userEvent.setup();
            render(<PersonalDetailsForm initialData={{ firstName: '', lastName: '', phone: '' }} email="t@t.com" onSubmit={vi.fn()} />);
            await user.click(screen.getByLabelText(/first name/i));
            await user.paste('x'.repeat(51));
            await submitForm();
            await waitFor(() => {
                expect(screen.getByText(/first name must be at most 50 characters/i)).toBeInTheDocument();
            });
            const field = screen.getByLabelText(/first name/i);
            expect(field).toHaveAttribute('aria-invalid', 'true');
            expect(field).toHaveAccessibleDescription(/first name must be at most 50 characters/i);
        });
        it('should show error when phone is invalid', async () => {
            const user = userEvent.setup();
            render(<PersonalDetailsForm {...defaultProps} initialData={{ firstName: 'John', lastName: 'Doe', phone: '' }} />);
            await user.clear(screen.getByLabelText(/phone number/i));
            await user.type(screen.getByLabelText(/phone number/i), 'not-a-number');
            await submitForm();
            await waitFor(() => {
                expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
            });
        });
    });
    describe('submission', () => {
        it('should call onSubmit with form data', async () => {
            const onSubmit = vi.fn().mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(
                <PersonalDetailsForm
                    initialData={{ firstName: '', lastName: '', phone: '' }}
                    email="john@example.com"
                    onSubmit={onSubmit}
                />
            );
            await user.type(screen.getByLabelText(/first name/i), 'Jane');
            await user.type(screen.getByLabelText(/last name/i), 'Smith');
            await user.type(screen.getByLabelText(/phone number/i), '9876543210');
            await submitForm();
            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        firstName: 'Jane',
                        lastName: 'Smith',
                        phone: '9876543210',
                    })
                );
            }, { timeout: 3000 });
        });
        it('should disable submit button when form is not dirty', () => {
            render(<PersonalDetailsForm {...defaultProps} />);
            const submitButton = getSubmitButton();
            expect(submitButton).toBeDisabled();
        });
    });
});