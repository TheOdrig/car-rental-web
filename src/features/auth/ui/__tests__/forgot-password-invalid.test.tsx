import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

vi.mock('@/features/auth/lib/use-password-reset', () => ({
    useForgotPassword: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useResetPassword: vi.fn(),
}));

import { ForgotPasswordForm } from '@/features/auth';

describe('ForgotPasswordForm invalid email', () => {
    it('marks the input invalid, links the message and focuses the field', async () => {
        renderWithProviders(<ForgotPasswordForm />);
        const input = screen.getByLabelText('Email Address');
        await userEvent.type(input, 'not-an-email');

        fireEvent.submit(input.closest('form')!);

        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'forgot-email-error');
        expect(document.getElementById('forgot-email-error')).toHaveTextContent('Please enter a valid email address');
        expect(input).toHaveFocus();
    });
});
