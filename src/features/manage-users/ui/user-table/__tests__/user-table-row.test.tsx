import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableBody } from '@/shared/ui/table';
import { UserTableRow } from '../user-table-row';
import type { User } from '../../../model/types';

function renderRow(overrides: Partial<User> = {}) {
    const user = {
        id: 4,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        roles: ['USER'],
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: '2026-01-02T10:00:00Z',
        ...overrides,
    } as User;
    return render(
        <Table>
            <TableBody>
                <UserTableRow user={user} onBan={vi.fn()} onUnban={vi.fn()} />
            </TableBody>
        </Table>
    );
}

describe('UserTableRow', () => {
    it('shows when the user last logged in', () => {
        renderRow({ lastLoginAt: '2030-05-06T12:00:00Z' });

        expect(screen.getByTestId('user-last-login')).toHaveTextContent(/May [5-7], 2030/);
    });

    it('says the user never logged in when there is no last login', () => {
        renderRow({ lastLoginAt: undefined });

        expect(screen.getByTestId('user-last-login')).toHaveTextContent('Never logged in');
    });

    it('marks the email as verified or not verified', () => {
        const { unmount } = renderRow({ isEmailVerified: true });
        expect(screen.getByLabelText('Email verified')).toBeInTheDocument();
        unmount();

        renderRow({ isEmailVerified: false });
        expect(screen.getByLabelText('Email not verified')).toBeInTheDocument();
        expect(screen.queryByLabelText('Email verified')).not.toBeInTheDocument();
    });
});
