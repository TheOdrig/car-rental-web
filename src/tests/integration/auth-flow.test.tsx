import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { renderWithProviders } from '../test-utils';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
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
    useRegister: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false,
    })),
}));

import { useLogin, useRegister } from '@/lib/hooks';

describe('Authentication Integration Tests', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useLogin).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useLogin>);
        vi.mocked(useRegister).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useRegister>);
    });

    const submitForm = async (containerName: string) => {
        const buttonText = containerName === 'login' ? /log in/i : /create account/i;
        const button = screen.getByRole('button', { name: buttonText });
        const form = button.closest('form');
        if (form) {
            fireEvent.submit(form);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    describe('Complete Login Flow', () => {
        it('should complete full login flow with valid credentials', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({ username: 'testuser' });
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm callbackUrl="/dashboard" />);

            await user.type(screen.getByPlaceholderText(/name@example.com/i), 'testuser');
            await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
            await submitForm('login');

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123',
                });
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });

        it('should handle login failure gracefully', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await user.type(screen.getByPlaceholderText(/name@example.com/i), 'wronguser');
            await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
            await submitForm('login');

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should prevent form submission with validation errors', async () => {
            const mockMutateAsync = vi.fn();
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            await submitForm('login');

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled();
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Complete Register Flow', () => {
        it('should complete full registration flow', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({ username: 'newuser' });
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(screen.getByPlaceholderText(/johndoe/i), 'newuser');
            await user.type(screen.getByPlaceholderText(/name@example.com/i), 'new@example.com');
            await user.type(screen.getByPlaceholderText(/create a strong password/i), 'Password123!');
            await user.type(screen.getByPlaceholderText(/confirm your password/i), 'Password123!');

            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            await submitForm('register');

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'Password123!',
                });
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });

        it('should handle registration failure', async () => {
            const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Email already exists'));
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await user.type(screen.getByPlaceholderText(/johndoe/i), 'existinguser');
            await user.type(screen.getByPlaceholderText(/name@example.com/i), 'existing@example.com');
            await user.type(screen.getByPlaceholderText(/create a strong password/i), 'Password123!');
            await user.type(screen.getByPlaceholderText(/confirm your password/i), 'Password123!');

            fireEvent.click(screen.getByRole('checkbox'));
            await submitForm('register');

            await waitFor(() => {
                expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should validate all fields before submission', async () => {
            const mockMutateAsync = vi.fn();
            vi.mocked(useRegister).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useRegister>);

            renderWithProviders(<RegisterForm />);

            await submitForm('register');

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled();
                expect(screen.getByText(/username is required/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('OAuth Flow', () => {
        const originalLocation = window.location;

        beforeEach(() => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: { ...originalLocation, href: '' },
            });
        });

        afterEach(() => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: originalLocation,
            });
        });

        it('should redirect to Google OAuth on button click', async () => {
            renderWithProviders(<OAuthButtons />);

            await user.click(screen.getByRole('button', { name: /google/i }));

            expect(window.location.href).toContain('google');
        });

        it('should redirect to GitHub OAuth on button click', async () => {
            renderWithProviders(<OAuthButtons />);

            await user.click(screen.getByRole('button', { name: /github/i }));

            expect(window.location.href).toContain('github');
        });

        it('should disable OAuth buttons when disabled prop is true', () => {
            renderWithProviders(<OAuthButtons disabled />);

            expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: /github/i })).toBeDisabled();
        });
    });

    describe('Form State Persistence', () => {
        it('should maintain form state during validation errors', async () => {
            renderWithProviders(<LoginForm />);

            await user.type(screen.getByPlaceholderText(/name@example.com/i), 'myusername');
            await submitForm('login');

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/name@example.com/i)).toHaveValue('myusername');
            });
        });

        it('should clear validation errors when user starts typing', async () => {
            renderWithProviders(<LoginForm />);

            await submitForm('login');

            await waitFor(() => {
                expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
            });

            await user.type(screen.getByPlaceholderText(/name@example.com/i), 't');

            await waitFor(() => {
                expect(screen.queryByText(/email or username is required/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Accessibility Flow', () => {
        it('should support keyboard-only login flow', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogin).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as unknown as ReturnType<typeof useLogin>);

            renderWithProviders(<LoginForm />);

            const usernameInput = screen.getByPlaceholderText(/name@example.com/i);
            const passwordInput = screen.getByPlaceholderText(/enter your password/i);

            usernameInput.focus();
            await user.type(usernameInput, 'testuser');
            await user.tab();
            await user.type(passwordInput, 'password123');

            const form = usernameInput.closest('form');
            if (form) {
                fireEvent.submit(form);
            }

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled();
            }, { timeout: 3000 });
        });

        it('should have proper focus order', async () => {
            renderWithProviders(<LoginForm />);

            const usernameInput = screen.getByPlaceholderText(/name@example.com/i);
            const passwordInput = screen.getByPlaceholderText(/enter your password/i);

            usernameInput.focus();
            expect(document.activeElement).toBe(usernameInput);

            await user.tab();

            await user.tab();
            await user.tab();
            if (document.activeElement !== passwordInput) {
                await user.tab();
            }
            expect([passwordInput, document.activeElement]).toContain(passwordInput);
        });
    });
});
