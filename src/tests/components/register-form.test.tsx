import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/register-form';
import { renderWithProviders } from '../test-utils';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/register',
}));

vi.mock('@/lib/hooks', () => ({
    useRegister: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false,
    })),
}));

import { useRegister } from '@/lib/hooks';

describe('RegisterForm', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRegister).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useRegister>);
    });

    const getUsernameInput = () => screen.getByPlaceholderText(/johndoe/i);
    const getEmailInput = () => screen.getByPlaceholderText(/name@example.com/i);
    const getPasswordInput = () => screen.getByPlaceholderText(/create a strong password/i);
    const getConfirmPasswordInput = () => screen.getByPlaceholderText(/confirm your password/i);
    const getSubmitButton = () => screen.getByRole('button', { name: /create account|creating account/i });
    const getTermsCheckbox = () => screen.getByRole('checkbox');

    describe('Rendering', () => {
        it('should render all form fields', () => {
            renderWithProviders(<RegisterForm />);

            expect(getUsernameInput()).toBeInTheDocument();
            expect(getEmailInput()).toBeInTheDocument();
            expect(getPasswordInput()).toBeInTheDocument();
            expect(getConfirmPasswordInput()).toBeInTheDocument();
            expect(getTermsCheckbox()).toBeInTheDocument();
            expect(getSubmitButton()).toBeInTheDocument();
        });

        it('should render login link', () => {
            renderWithProviders(<RegisterForm />);

            expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show error when username is empty', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getEmailInput(), 'test@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        });

        it('should show error when email is invalid', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'testuser');
            // test@test passes HTML5 email validation but fails the regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            await user.type(getEmailInput(), 'test@test');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText(/valid email/i)).toBeInTheDocument();
            });
        });

        it('should show error when password is too short', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getEmailInput(), 'test@example.com');
            await user.type(getPasswordInput(), 'Pass1!');
            await user.type(getConfirmPasswordInput(), 'Pass1!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
        });

        it('should show error when passwords do not match', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getEmailInput(), 'test@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'DifferentPass!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });

        it('should show error when terms not accepted', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getEmailInput(), 'test@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getSubmitButton());

            expect(screen.getByText(/must accept the terms/i)).toBeInTheDocument();
        });
    });

    describe('Password Strength', () => {
        it('should show password strength indicator when typing', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getPasswordInput(), 'Password123!');

            expect(screen.getByText(/password strength/i)).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading state during submission', () => {
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
        });

        it('should disable all inputs during submission', () => {
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            expect(getUsernameInput()).toBeDisabled();
            expect(getEmailInput()).toBeDisabled();
            expect(getPasswordInput()).toBeDisabled();
            expect(getConfirmPasswordInput()).toBeDisabled();
            expect(getTermsCheckbox()).toBeDisabled();
        });
    });

    describe('Successful Registration', () => {
        it('should call register API with form data', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'newuser');
            await user.type(getEmailInput(), 'new@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'Password123!',
                });
            });
        });

        it('should redirect to home after successful registration', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'newuser');
            await user.type(getEmailInput(), 'new@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });
    });

    describe('Error Display', () => {
        it('should show form error on registration failure', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Registration failed'));
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'existinguser');
            await user.type(getEmailInput(), 'existing@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
            });
        });
    });

    describe('Validation Icons', () => {
        it('should show success border for valid username after blur', async () => {
            renderWithProviders(<RegisterForm />);

            const usernameInput = getUsernameInput();
            await user.type(usernameInput, 'testuser');
            await user.tab();

            expect(usernameInput).toHaveClass('border-green-500');
        });

        it('should show success border for valid email after blur', async () => {
            renderWithProviders(<RegisterForm />);

            const emailInput = getEmailInput();
            await user.type(emailInput, 'test@example.com');
            await user.tab();

            expect(emailInput).toHaveClass('border-green-500');
        });

        it('should show success border for matching passwords', async () => {
            renderWithProviders(<RegisterForm />);

            await user.type(getPasswordInput(), 'Password123!');
            const confirmInput = getConfirmPasswordInput();
            await user.type(confirmInput, 'Password123!');
            await user.tab();

            expect(confirmInput).toHaveClass('border-green-500');
        });

        it('should clear form error when user starts typing', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Registration failed'));
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getEmailInput(), 'test@example.com');
            await user.type(getPasswordInput(), 'Password123!');
            await user.type(getConfirmPasswordInput(), 'Password123!');
            await user.click(getTermsCheckbox());
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
            });

            await user.type(getUsernameInput(), 'x');
            expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
        });
    });
});
