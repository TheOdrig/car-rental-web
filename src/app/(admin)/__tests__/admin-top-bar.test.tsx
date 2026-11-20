import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders as render } from '@/app/testing/test-utils';
import { AdminTopBar } from '../admin-top-bar';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/dashboard',
}));
vi.mock('@/features/auth', () => ({
    useAuth: () => ({ user: { username: 'root', email: 'root@example.com' }, logout: vi.fn() }),
}));

describe('AdminTopBar', () => {
    it('offers a link back to the public site, the theme toggle and the account menu', () => {
        render(<AdminTopBar username="root" />);

        expect(screen.getByRole('link', { name: 'View site' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
    });

    it('has exactly one menu button for the admin navigation', () => {
        render(<AdminTopBar username="root" />);

        expect(screen.getAllByRole('button', { name: /menu/i }).map((button) => button.getAttribute('aria-label'))).toEqual([
            'Open admin menu',
            'Account menu',
        ]);
    });

    it('does not carry the public navigation', () => {
        render(<AdminTopBar username="root" />);

        expect(screen.queryByRole('link', { name: 'Browse Cars' })).not.toBeInTheDocument();
    });
});
