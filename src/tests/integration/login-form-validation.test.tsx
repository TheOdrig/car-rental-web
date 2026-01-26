import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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

describe('LoginForm - Validation State Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useLogin).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useLogin>);
    });

    const getUsernameInput = () => screen.getByPlaceholderText(/name@example.com/i);
    const getPasswordInput = () => screen.getByPlaceholderText(/enter your password/i);
    const getSubmitButton = () => screen.getByRole('button', { name: /log in|signing in/i });

    const submitForm = async () => {
        const form = getSubmitButton().closest('form');
        if (form) {
            fireEvent.submit(form);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    describe('Validation State Flow', () => {
        it('should show valid state after typing valid email and blurring', async () => {
            renderWithProviders(<LoginForm />);

            const usernameInput = getUsernameInput();
            await user.type(usernameInput, 'test@example.com');
            fireEvent.blur(usernameInput);

            await waitFor(() => {
                expect(usernameInput).toHaveClass('border-green-500');
            });
        });

        it('should show valid state after typing valid password and blurring', async () => {
            renderWithProviders(<LoginForm />);

            const passwordInput = getPasswordInput();
            await user.type(passwordInput, 'validpassword123');
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(passwordInput).toHaveClass('border-green-500');
            });
        });

        it('should show error state after submit with empty fields', async () => {
            renderWithProviders(<LoginForm />);

            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should clear error when user starts typing', async () => {
            renderWithProviders(<LoginForm />);

            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
            });

            await user.type(getUsernameInput(), 'a');

            await waitFor(() => {
                expect(screen.queryByText(/email or username is required/i)).not.toBeInTheDocument();
            });
        });

        it('should show password too short error on submit', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), '12345');
            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Error Handling', () => {
        it('should clear form error when user starts typing after failed login', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(getUsernameInput(), 'testuser');
            await user.type(getPasswordInput(), 'wrongpassword');
            await submitForm();

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            await user.type(getUsernameInput(), 'x');

            await waitFor(() => {
                expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have role="alert" on error messages', async () => {
            renderWithProviders(<LoginForm />);

            await submitForm();

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should render form with required labels', () => {
            renderWithProviders(<LoginForm />);

            expect(screen.getByText('Email or Username')).toBeInTheDocument();
            expect(screen.getByText('Password')).toBeInTheDocument();

            const requiredMarkers = screen.getAllByText('*');
            expect(requiredMarkers.length).toBeGreaterThanOrEqual(2);
        });
    });
});

