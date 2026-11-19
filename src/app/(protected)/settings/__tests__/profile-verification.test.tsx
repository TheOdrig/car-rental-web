import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';

const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { ProfileSettingsContent } from '../profile/profile-settings-content';

const profile = { id: 1, username: 'jdoe', email: 'jdoe@example.com', firstName: 'Jo', lastName: 'Doe', roles: ['ROLE_USER'] };

describe('profile email verification', () => {
    beforeEach(() => {
        clientGet.mockReset();
    });

    it('shows Verified when the profile says the email is verified', async () => {
        clientGet.mockResolvedValue({ ...profile, emailVerified: true });

        renderWithProviders(<ProfileSettingsContent />);

        expect(await screen.findByText('Verified')).toBeInTheDocument();
    });

    it('shows Not verified when the profile says it is not', async () => {
        clientGet.mockResolvedValue({ ...profile, emailVerified: false });

        renderWithProviders(<ProfileSettingsContent />);

        expect(await screen.findByText('Not verified')).toBeInTheDocument();
    });
});
