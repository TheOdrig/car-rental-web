import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
    useCurrentUser,
    useLogin,
    useLogout,
    useRegister,
    authKeys
} from '@/lib/hooks/use-auth';
import { createQueryWrapper } from '../test-utils';
import type { MeResponse, LoginResponse } from '@/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

vi.mock('@/lib/api/client', () => ({
    clientGet: vi.fn(),
    clientPost: vi.fn(),
}));

vi.mock('@/lib/utils/toast', () => ({
    showToast: {
        success: vi.fn(),
        error: vi.fn(),
    },
    toastMessages: {
        auth: {
            loginSuccess: 'Welcome back!',
            loginError: 'Login failed',
            logoutSuccess: 'Logged out',
        },
    },
}));

import { clientGet, clientPost } from '@/lib/api/client';

const mockMeResponse: MeResponse = {
    id: 1,
    username: 'testuser',
    roles: ['USER'],
    exp: Date.now() / 1000 + 3600,
};

const mockLoginResponse: LoginResponse = {
    username: 'testuser',
    tokenType: 'Bearer',
};

describe('Auth Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useCurrentUser', () => {
        it('should return user data when authenticated', async () => {
            vi.mocked(clientGet).mockResolvedValueOnce(mockMeResponse);

            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createQueryWrapper()
            });

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => expect(result.current.isLoading).toBe(false));

            expect(result.current.user).toEqual({
                id: 1,
                username: 'testuser',
                email: '',
                roles: ['USER'],
            });
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.isAdmin).toBe(false);
        });

        it('should identify admin user correctly', async () => {
            vi.mocked(clientGet).mockResolvedValueOnce({
                ...mockMeResponse,
                roles: ['ADMIN'],
            });

            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createQueryWrapper()
            });

            await waitFor(() => expect(result.current.isLoading).toBe(false));

            expect(result.current.isAdmin).toBe(true);
        });

        it('should return null user when not authenticated', async () => {
            vi.mocked(clientGet).mockRejectedValueOnce(new Error('Unauthorized'));

            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createQueryWrapper()
            });

            await waitFor(() => expect(result.current.isLoading).toBe(false));

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe('useLogin', () => {
        it('should call login API with credentials', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce(mockLoginResponse);
            vi.mocked(clientGet).mockResolvedValueOnce(mockMeResponse);

            const { result } = renderHook(() => useLogin(), {
                wrapper: createQueryWrapper()
            });

            await result.current.mutateAsync({ username: 'test', password: 'pass' });

            expect(clientPost).toHaveBeenCalledWith('/api/auth/login', {
                username: 'test',
                password: 'pass',
            });
        });

        it('should handle login error', async () => {
            vi.mocked(clientPost).mockRejectedValueOnce(new Error('Invalid credentials'));

            const { result } = renderHook(() => useLogin(), {
                wrapper: createQueryWrapper()
            });

            await expect(
                result.current.mutateAsync({ username: 'test', password: 'wrong' })
            ).rejects.toThrow('Invalid credentials');

            await waitFor(() => expect(result.current.isError).toBe(true));
        });
    });

    describe('useLogout', () => {
        it('should call logout API and redirect to home', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce({ message: 'Logged out' });

            const { result } = renderHook(() => useLogout(), {
                wrapper: createQueryWrapper()
            });

            await result.current.mutateAsync();

            expect(clientPost).toHaveBeenCalledWith('/api/auth/logout');
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    describe('useRegister', () => {
        it('should call register API with user data', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce(mockLoginResponse);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createQueryWrapper()
            });

            await result.current.mutateAsync({
                username: 'newuser',
                email: 'new@example.com',
                password: 'Pass123!',
            });

            expect(clientPost).toHaveBeenCalledWith('/api/auth/register', {
                username: 'newuser',
                email: 'new@example.com',
                password: 'Pass123!',
            });
        });

        it('should handle registration error', async () => {
            vi.mocked(clientPost).mockRejectedValueOnce(new Error('Email exists'));

            const { result } = renderHook(() => useRegister(), {
                wrapper: createQueryWrapper()
            });

            await expect(
                result.current.mutateAsync({
                    username: 'existing',
                    email: 'exists@example.com',
                    password: 'Pass123!',
                })
            ).rejects.toThrow('Email exists');
        });
    });

    describe('authKeys', () => {
        it('should have correct key structure', () => {
            expect(authKeys.all).toEqual(['auth']);
            expect(authKeys.me()).toEqual(['auth', 'me']);
        });
    });
});
