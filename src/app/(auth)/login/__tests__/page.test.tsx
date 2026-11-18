import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

vi.mock('@/features/auth', () => ({
    LoginForm: () => <div data-testid="login-form" />,
    OAuthButtons: () => <div />,
    OAuthDivider: () => <div />,
    FormError: ({ message }: { message: string }) => <div role="alert">{message}</div>,
    oauthErrorMessage: (code?: string) => (code ? `message for ${code}` : null),
}));

describe('login page', () => {
    it('shows the OAuth error from the query string', async () => {
        render(await LoginPage({ searchParams: Promise.resolve({ error: 'local_account_unverified' }) }));

        expect(screen.getByRole('alert')).toHaveTextContent('message for local_account_unverified');
    });

    it('shows no alert without an error code', async () => {
        render(await LoginPage({ searchParams: Promise.resolve({}) }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
