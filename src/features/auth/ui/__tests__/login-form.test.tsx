import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

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

vi.mock('@/features/auth/lib/use-auth', () => ({
    useLogin: vi.fn(),
    useLogout: vi.fn(),
    useRegister: vi.fn(),
    useAuth: vi.fn(),
    useCurrentUser: vi.fn(),
    authKeys: { all: ['auth'] },
}));

import { ApiError } from '@/shared/api';
import { LoginForm } from '@/features/auth';
import { useLogin } from '@/features/auth/lib/use-auth';

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

    const submitForm = () => {
        const form = getSubmitButton().closest('form');
        if (form) {
            fireEvent.submit(form);
        }
    };

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
            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
            });
        });

        it('should show error when password is empty', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
        });

        it('should show error when password is too short', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), '12345');
            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
            });
        });

        it('should clear field error when user starts typing', async () => {
            renderWithProviders(<LoginForm />);

            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
            });

            await user.type(getUsernameInput(), 't');

            await waitFor(() => {
                expect(screen.queryByText(/email or username is required/i)).not.toBeInTheDocument();
            });
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
            submitForm();

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });
    });

    describe('Rate limiting', () => {
        it('should show a retry hint when the API answers 429 with Retry-After', async () => {
            const limited = new ApiError({
                status: 429,
                message: 'Too many requests',
                timestamp: new Date().toISOString(),
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: 30,
            });
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn().mockRejectedValue(limited),
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'password123');
            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/too many attempts.*30 seconds/i)).toBeInTheDocument();
            });
            expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
        });
    });

    describe('Banned account', () => {
        it('should show the suspended message instead of invalid credentials', async () => {
            const banned = new ApiError({
                status: 403,
                message: 'Account is banned',
                timestamp: new Date().toISOString(),
                code: 'ACCOUNT_BANNED',
            });
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn().mockRejectedValue(banned),
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'password123');
            submitForm();

            await waitFor(() => {
                expect(screen.getByText(/account has been suspended/i)).toBeInTheDocument();
            });
            expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
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
            submitForm();

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
            submitForm();

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('Unsafe callback URL', () => {
        it('should land an administrator on the admin dashboard when no return page was requested', async () => {
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn().mockResolvedValue({ principal: { roles: ['ADMIN'] } }),
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'admin');
            await user.type(getPasswordInput(), 'password123');
            submitForm();

            await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/dashboard'));
        });

        it('should keep an explicit return page for an administrator', async () => {
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: vi.fn().mockResolvedValue({ principal: { roles: ['ADMIN'] } }),
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm callbackUrl="/admin/users" />);

            await user.type(getUsernameInput(), 'admin');
            await user.type(getPasswordInput(), 'password123');
            submitForm();

            await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/users'));
        });

        it('should ignore an external callback URL after login', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm callbackUrl="//evil.example/steal" />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'password123');
            submitForm();

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/');
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

    describe('Validation Icons', () => {
        it('should show success icon when username is valid after blur', async () => {
            renderWithProviders(<LoginForm />);

            const usernameInput = getUsernameInput();
            await user.type(usernameInput, 'testuser');
            fireEvent.blur(usernameInput);

            await waitFor(() => {
                expect(usernameInput).toHaveClass('border-green-500');
            });
        });

        it('should show success icon for valid password after blur', async () => {
            renderWithProviders(<LoginForm />);

            const passwordInput = getPasswordInput();
            await user.type(passwordInput, 'password123');
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(passwordInput).toHaveClass('border-green-500');
            });
        });

        it('should clear form error when user starts typing', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'wrongpassword');
            submitForm();

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });

            await user.type(getUsernameInput(), 'x');

            await waitFor(() => {
                expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
            });
        });
    });
});