import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

const clientGet = vi.fn();
const clientPut = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return {
        ...original,
        clientGet: (...args: unknown[]) => clientGet(...args),
        clientPut: (...args: unknown[]) => clientPut(...args),
    };
});

import { ApiError } from '@/shared/api';
import { ProfileSettingsContent } from '../profile/profile-settings-content';

const profile = {
    id: 1,
    username: 'jdoe',
    email: 'jdoe@example.com',
    firstName: 'Jo',
    lastName: 'Doe',
    phone: '',
    emailVerified: true,
    roles: ['ROLE_USER'],
};

describe('profile phone', () => {
    beforeEach(() => {
        clientGet.mockReset();
        clientPut.mockReset();
        clientGet.mockResolvedValue(profile);
    });

    it('blocks a phone number the API would reject before sending it', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ProfileSettingsContent />);

        await user.type(await screen.findByLabelText(/phone number/i), '12345');
        fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form')!);

        expect(await screen.findByText(/invalid phone number format/i)).toBeInTheDocument();
        expect(clientPut).not.toHaveBeenCalled();
    });

    it('shows the API field error under the phone field', async () => {
        clientPut.mockRejectedValue(
            new ApiError({
                status: 400,
                message: 'Validation failed',
                timestamp: new Date().toISOString(),
                code: 'VALIDATION_FAILED',
                errors: [{ field: 'phone', message: 'must match the expected phone pattern' }],
            })
        );
        const user = userEvent.setup();
        renderWithProviders(<ProfileSettingsContent />);

        await user.type(await screen.findByLabelText(/phone number/i), '+905551234567');
        fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form')!);

        await waitFor(() => expect(clientPut).toHaveBeenCalled());
        expect(await screen.findByText('must match the expected phone pattern')).toBeInTheDocument();
    });
});
