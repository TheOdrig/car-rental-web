import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';
import { getSession } from '@/shared/server';
import AdminLayout from '../layout';

vi.mock('@/shared/server', () => ({
    getSession: vi.fn(),
    isAdminSession: (session: { roles: string[] } | null) => session?.roles.includes('ADMIN') ?? false,
}));

vi.mock('@/features/admin', () => ({
    AdminSidebar: ({ username }: { username: string }) => <nav>{username}</nav>,
}));

describe('AdminLayout', () => {
    beforeEach(() => {
        vi.mocked(redirect).mockImplementation((path: string) => {
            throw new Error(`NEXT_REDIRECT:${path}`);
        });
    });

    it('redirects anonymous visitors to login', async () => {
        vi.mocked(getSession).mockResolvedValue(null);

        await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login');
    });

    it('redirects verified non-admins to /forbidden', async () => {
        vi.mocked(getSession).mockResolvedValue({ userId: 1, username: 'bob', roles: ['USER'], exp: 1 });

        await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/forbidden');
    });

    it('renders for a verified admin', async () => {
        vi.mocked(getSession).mockResolvedValue({ userId: 2, username: 'root', roles: ['ADMIN'], exp: 1 });

        await expect(AdminLayout({ children: null })).resolves.toBeTruthy();
        expect(redirect).not.toHaveBeenCalled();
    });
});
