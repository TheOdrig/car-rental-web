import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/app/testing/test-utils';

const nav = vi.hoisted(() => ({ search: '', replace: vi.fn() }));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(nav.search),
    useRouter: () => ({ push: vi.fn(), replace: nav.replace }),
    usePathname: () => '/admin/users',
}));
vi.mock('@/shared/ui/breadcrumb', () => ({ Breadcrumb: () => null }));
vi.mock('@/features/manage-users', () => ({
    useUserStats: () => ({ data: { totalUsers: 1, activeUsers: 1, bannedUsers: 0 }, isLoading: false, isError: false, refetch: vi.fn() }),
    useInvalidateUsers: () => ({ all: vi.fn() }),
    UserStatsCards: () => null,
    UserTable: ({ searchQuery }: { searchQuery: string }) => <div data-testid="user-table">{searchQuery}</div>,
}));

import { UserManagementContent } from '../users/user-management-content';

function renderPage() {
    const Wrapper = createQueryWrapper();
    return render(
        <Wrapper>
            <UserManagementContent />
        </Wrapper>
    );
}

describe('user management search parameter', () => {
    beforeEach(() => {
        nav.search = '';
        nav.replace.mockClear();
    });

    it('starts with the search from the URL', () => {
        nav.search = 'search=e2e_';

        renderPage();

        expect(screen.getByRole('textbox', { name: 'Search users' })).toHaveValue('e2e_');
        expect(screen.getByTestId('user-table')).toHaveTextContent('e2e_');
        expect(nav.replace).not.toHaveBeenCalled();
    });

    it('writes a typed search back to the URL', async () => {
        renderPage();

        await userEvent.type(screen.getByRole('textbox', { name: 'Search users' }), 'ada');

        expect(nav.replace).toHaveBeenLastCalledWith('/admin/users?search=ada', { scroll: false });
    });
});
