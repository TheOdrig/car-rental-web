import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMobileMenu, AdminSidebar } from '../admin-sidebar';

vi.mock('next/navigation', () => ({ usePathname: () => '/admin/dashboard' }));

function mockViewport(matches: boolean) {
    window.matchMedia = vi.fn().mockImplementation(() => ({
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
}

describe('AdminSidebar', () => {
    afterEach(() => {
        Reflect.deleteProperty(window, 'matchMedia');
    });

    it('links to alerts and to every other admin area', () => {
        render(<AdminSidebar username="admin" />);

        for (const name of ['Dashboard', 'Fleet Management', 'Customers', 'Rental Management', 'Damage Reports', 'Alerts', 'Late Returns']) {
            expect(screen.getByRole('link', { name })).toBeInTheDocument();
        }
        expect(screen.getByRole('link', { name: 'Alerts' })).toHaveAttribute('href', '/admin/alerts');
    });

    it('starts collapsed on a tablet-sized viewport and keeps accessible link names', () => {
        mockViewport(true);
        render(<AdminSidebar username="admin" />);

        expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Rental Management' })).toBeInTheDocument();
    });

    it('offers the navigation through a menu button on narrow screens', async () => {
        const user = userEvent.setup();
        render(<AdminMobileMenu username="admin" />);

        await user.click(screen.getByRole('button', { name: 'Open admin menu' }));

        const menu = await screen.findByRole('dialog', { name: 'Admin Panel' });
        expect(menu).toHaveTextContent('Rental Management');
        expect(screen.getByRole('navigation', { name: 'Admin mobile navigation' })).toBeInTheDocument();
    });

    it('stays expanded on a wide viewport', () => {
        mockViewport(false);
        render(<AdminSidebar username="admin" />);

        expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
    });
});
