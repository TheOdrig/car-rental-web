import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { renderWithProviders } from '../test-utils';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/login',
}));

vi.mock('@/lib/hooks', () => ({
    useLogin: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false,
    })),
}));

import { useLogin } from '@/lib/hooks';

describe('LoginForm', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useLogin).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useLogin>);
    });

    const getPasswordInput = () => screen.getByPlaceholderText(/enter your password/i);
    const getUsernameInput = () => screen.getByPlaceholderText(/name@example.com/i);
    const getSubmitButton = () => screen.getByRole('button', { name: /log in|signing in/i });

    describe('Rendering', () => {
        it('should render username input', () => {
            renderWithProviders(<LoginForm />);
            expect(getUsernameInput()).toBeInTheDocument();
        });

        it('should render password input', () => {
            renderWithProviders(<LoginForm />);
            expect(getPasswordInput()).toBeInTheDocument();
        });

        it('should render login button', () => {
            renderWithProviders(<LoginForm />);
            expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
        });

        it('should render forgot password link', () => {
            renderWithProviders(<LoginForm />);
            expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show error when username is empty', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getPasswordInput(), 'password123');
            await user.click(getSubmitButton());

            expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
        });

        it('should show error when password is empty', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.click(getSubmitButton());

            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        it('should show error when password is too short', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), '12345');
            await user.click(getSubmitButton());

            expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });

        it('should clear field error when user starts typing', async () => {
            renderWithProviders(<LoginForm />);

            await user.click(getSubmitButton());
            expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();

            await user.type(getUsernameInput(), 't');
            expect(screen.queryByText(/email or username is required/i)).not.toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading state during submission', () => {
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
        });

        it('should disable inputs during submission', () => {
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            expect(getUsernameInput()).toBeDisabled();
            expect(getPasswordInput()).toBeDisabled();
        });
    });

    describe('Error Display', () => {
        it('should show form error on login failure', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'wrongpassword');
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });
    });

    describe('Successful Login', () => {
        it('should call login API with form data', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'password123');
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123',
                });
            });
        });

        it('should redirect to callback URL after login', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm callbackUrl="/dashboard" />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'password123');
            await user.click(getSubmitButton());

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('Password Visibility Toggle', () => {
        it('should toggle password visibility', async () => {
            renderWithProviders(<LoginForm />);

            const passwordInput = getPasswordInput();
            expect(passwordInput).toHaveAttribute('type', 'password');

            await user.click(screen.getByLabelText(/show password/i));
            expect(passwordInput).toHaveAttribute('type', 'text');

            await user.click(screen.getByLabelText(/hide password/i));
            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });
});
