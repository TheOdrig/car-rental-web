import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import SettingsLayout from '../layout';
import SecuritySettingsPage from '../security/page';

vi.mock('next/navigation', () => ({
    usePathname: () => '/settings/security',
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('settings pages', () => {
    it('lists only the tabs that are backed by real features', () => {
        renderWithProviders(
            <SettingsLayout>
                <div />
            </SettingsLayout>
        );

        const labels = screen.getAllByRole('link').map((link) => link.textContent?.trim());
        expect(labels).toEqual(expect.arrayContaining(['Personal Info', 'Security', 'Payment Methods']));
        expect(labels).not.toContain('Documents');
        expect(labels).not.toContain('Notifications');
        expect(screen.queryByText('Soon')).not.toBeInTheDocument();
    });

    it('offers password change without a fake two-factor switch', () => {
        renderWithProviders(<SecuritySettingsPage />);

        expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
        expect(screen.queryByText(/two-factor/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
});
