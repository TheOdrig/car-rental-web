import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/entities/user/model/store';
import { User, UserRole } from '@/entities/user/model/types';
import { isAdmin, getDisplayName, getInitials } from '@/entities/user/lib/utils';
import { act } from 'react';

const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: [UserRole.USER],
};

const mockAdmin: User = {
    id: 2,
    email: 'admin@example.com',
    name: 'Admin User',
    roles: [UserRole.USER, UserRole.ADMIN],
};

const mockUserNoName: User = {
    id: 3,
    email: 'noname@example.com',
    name: '',
    roles: [UserRole.USER],
};

describe('User Entity', () => {
    describe('Utils', () => {
        describe('isAdmin', () => {
            it('should return true for admin user', () => {
                expect(isAdmin(mockAdmin)).toBe(true);
            });

            it('should return false for regular user', () => {
                expect(isAdmin(mockUser)).toBe(false);
            });

            it('should return false for null user', () => {
                expect(isAdmin(null)).toBe(false);
            });
        });

        describe('getDisplayName', () => {
            it('should return name if available', () => {
                expect(getDisplayName(mockUser)).toBe('Test User');
            });

            it('should return email if name is empty', () => {
                expect(getDisplayName(mockUserNoName)).toBe('noname@example.com');
            });

            it('should return Guest if user is null', () => {
                expect(getDisplayName(null)).toBe('Guest');
            });
        });

        describe('getInitials', () => {
            it('should return initials from name', () => {
                expect(getInitials(mockUser)).toBe('TU');
            });

            it('should return initials from email if name is missing', () => {
                expect(getInitials(mockUserNoName)).toBe('NO');
            });

            it('should return ? if user is null', () => {
                expect(getInitials(null)).toBe('?');
            });
        });
    });

    describe('Store', () => {
        beforeEach(() => {
            act(() => {
                useUserStore.setState({ user: null, isAuthenticated: false });
            })
        });

        it('should set user and authentication status', () => {
            const { setUser } = useUserStore.getState();

            act(() => {
                setUser(mockUser);
            });

            const State = useUserStore.getState();
            expect(State.user).toEqual(mockUser);
            expect(State.isAuthenticated).toBe(true);
        });

        it('should update user partially', () => {
            const { setUser, updateUser } = useUserStore.getState();

            act(() => {
                setUser(mockUser);
                updateUser({ name: 'Updated Name' });
            });

            const state = useUserStore.getState();
            expect(state.user?.name).toBe('Updated Name');
            expect(state.user?.email).toBe(mockUser.email); // Should persist other fields
        });

        it('should not update user if user is null', () => {
            const { updateUser } = useUserStore.getState();

            act(() => {
                updateUser({ name: 'Updated Name' });
            })

            const state = useUserStore.getState();
            expect(state.user).toBeNull();
        });

        it('should logout correctly', () => {
            const { setUser, logout } = useUserStore.getState();

            act(() => {
                setUser(mockUser);
                logout();
            })

            const state = useUserStore.getState();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });
    });
});
