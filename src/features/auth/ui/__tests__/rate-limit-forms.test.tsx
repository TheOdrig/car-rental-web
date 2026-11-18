import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

vi.mock('@/features/auth/lib/use-auth', () => ({
    useRegister: vi.fn(),
    useLogin: vi.fn(),
    useLogout: vi.fn(),
    useAuth: vi.fn(),
    useCurrentUser: vi.fn(),
    authKeys: { all: ['auth'] },
}));

vi.mock('@/features/auth/lib/use-password-reset', () => ({
    useForgotPassword: vi.fn(),
    useResetPassword: vi.fn(),
}));

import { ApiError } from '@/shared/api';
import { ForgotPasswordForm, RegisterForm, ResetPasswordForm } from '@/features/auth';
import { useRegister } from '@/features/auth/lib/use-auth';
import { useForgotPassword, useResetPassword } from '@/features/auth/lib/use-password-reset';

function rateLimited(retryAfter?: number): ApiError {
    return new ApiError({
        status: 429,
        message: 'Too many requests',
        timestamp: new Date().toISOString(),
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
    });
}

describe('rate limit messages on the auth forms', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the wait time on the forgot-password form', async () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            mutateAsync: vi.fn().mockRejectedValue(rateLimited(45)),
            isPending: false,
        } as unknown as ReturnType<typeof useForgotPassword>);

        renderWithProviders(<ForgotPasswordForm />);
        await user.type(screen.getByPlaceholderText('name@example.com'), 'a@b.co');
        fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/too many attempts.*45 seconds/i)).toBeInTheDocument();
        });
    });

    it('shows the wait time in minutes on the reset-password form', async () => {
        vi.mocked(useResetPassword).mockReturnValue({
            mutateAsync: vi.fn().mockRejectedValue(rateLimited(120)),
            isPending: false,
        } as unknown as ReturnType<typeof useResetPassword>);

        renderWithProviders(<ResetPasswordForm token="tok" />);
        await user.type(screen.getByPlaceholderText('Enter new password'), 'password123');
        await user.type(screen.getByPlaceholderText('Confirm new password'), 'password123');
        fireEvent.submit(screen.getByPlaceholderText('Enter new password').closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/too many attempts.*2 minutes/i)).toBeInTheDocument();
        });
    });

    it('shows a generic wait message on the register form when Retry-After is missing', async () => {
        vi.mocked(useRegister).mockReturnValue({
            mutateAsync: vi.fn().mockRejectedValue(rateLimited()),
            isPending: false,
        } as unknown as ReturnType<typeof useRegister>);

        renderWithProviders(<RegisterForm />);
        await user.type(screen.getByPlaceholderText(/johndoe/i), 'johndoe');
        await user.type(screen.getByPlaceholderText('name@example.com'), 'john@example.com');
        await user.type(screen.getByPlaceholderText(/create a strong password/i), 'Password123!');
        await user.type(screen.getByPlaceholderText(/confirm your password/i), 'Password123!');
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/too many attempts. please wait a moment/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    });
});
