import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
    useCurrentUser,
    useLogin,
    useLogout,
    useRegister,
    authKeys
} from '@/features/auth';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { useSessionKeeper } from '../use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import type { MeResponse, LoginResponse } from '@/features/auth';
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
vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api');
    return {
        ...actual,
        clientGet: vi.fn(),
        clientPost: vi.fn(),
        onSessionExpired: vi.fn(actual.onSessionExpired),
    };
});
vi.mock('@/shared/lib', () => ({
    showToast: {
        success: vi.fn(),
        error: vi.fn(),
    },
    toastMessages: {
        auth: {
            loginSuccess: 'Signed in',
            loginError: 'Login failed',
            logoutSuccess: 'Logged out',
        },
    },
}));
import { clientGet, clientPost, ApiError, onSessionExpired } from '@/shared/api';
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
            vi.mocked(clientGet).mockRejectedValue(new Error('Unauthorized'));
            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createQueryWrapper()
            });
            await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });
    describe('useCurrentUser when the session is gone', () => {
        it('treats a 401 from /api/auth/me as signed out without retrying', async () => {
            vi.mocked(clientGet).mockRejectedValue(new ApiError(401, 'Not authenticated'));
            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createQueryWrapper()
            });
            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.user).toBeNull();
            expect(result.current.error).toBeNull();
            expect(clientGet).toHaveBeenCalledTimes(1);
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
    describe('principal change', () => {
        function seeded() {
            const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
            client.setQueryData(['rentals', 'me'], { content: [{ id: 1 }] });
            const wrapper = ({ children }: { children: ReactNode }) => (
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            );
            return { client, wrapper };
        }

        it('clears every cached query after a successful logout', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce({ message: 'Logged out' });
            const { client, wrapper } = seeded();
            const { result } = renderHook(() => useLogout(), { wrapper });

            await result.current.mutateAsync();

            await waitFor(() => expect(client.getQueryData(['rentals', 'me'])).toBeUndefined());
            expect(client.getQueryData(authKeys.me())).toBeNull();
        });

        it('clears every cached query when logout fails', async () => {
            vi.mocked(clientPost).mockRejectedValueOnce(new Error('network'));
            const { client, wrapper } = seeded();
            const { result } = renderHook(() => useLogout(), { wrapper });

            await expect(result.current.mutateAsync()).rejects.toThrow('network');

            await waitFor(() => expect(client.getQueryData(['rentals', 'me'])).toBeUndefined());
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('drops the previous principal data after login and loads the new one', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce(mockLoginResponse);
            vi.mocked(clientGet).mockResolvedValueOnce(mockMeResponse);
            const { client, wrapper } = seeded();
            const { result } = renderHook(() => useLogin(), { wrapper });

            await result.current.mutateAsync({ username: 'test', password: 'pass' });

            expect(client.getQueryData(['rentals', 'me'])).toBeUndefined();
            expect(client.getQueryData(authKeys.me())).toEqual(mockMeResponse);
        });

        it('drops the previous principal data after registration', async () => {
            vi.mocked(clientPost).mockResolvedValueOnce(mockLoginResponse);
            vi.mocked(clientGet).mockResolvedValueOnce(mockMeResponse);
            const { client, wrapper } = seeded();
            const { result } = renderHook(() => useRegister(), { wrapper });

            await result.current.mutateAsync({ username: 'n', email: 'n@example.com', password: 'Pass123!' });

            expect(client.getQueryData(['rentals', 'me'])).toBeUndefined();
        });
    });
    describe('session expiry during logout', () => {
        const assign = vi.fn();

        function expiryHandler(): () => void {
            const calls = vi.mocked(onSessionExpired).mock.calls;
            const handler = [...calls].reverse().map(([fn]) => fn).find((fn) => fn !== null);
            if (!handler) throw new Error('no expiry handler registered');
            return handler;
        }

        beforeEach(() => {
            assign.mockClear();
            vi.mocked(onSessionExpired).mockClear();
            vi.stubGlobal('location', {
                pathname: '/rentals',
                search: '?page=2',
                origin: 'http://localhost',
                assign,
            });
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        function mountKeeperAndLogout() {
            vi.mocked(clientGet).mockResolvedValue(mockMeResponse);
            return renderHook(
                () => {
                    useSessionKeeper();
                    return useLogout();
                },
                { wrapper: createQueryWrapper() }
            );
        }

        it('redirects to login when the session expires outside a logout', async () => {
            mountKeeperAndLogout();

            expiryHandler()();

            expect(assign).toHaveBeenCalledTimes(1);
            expect(String(assign.mock.calls[0][0])).toContain('/login?callbackUrl=');
        });

        it('does not redirect to login when a request fails with 401 while logging out', async () => {
            let finishLogout: (value: { message: string }) => void = () => undefined;
            vi.mocked(clientPost).mockReturnValueOnce(
                new Promise((resolve) => {
                    finishLogout = resolve as typeof finishLogout;
                })
            );
            const { result } = mountKeeperAndLogout();

            const pending = result.current.mutateAsync();
            await waitFor(() => expect(result.current.isPending).toBe(true));
            expiryHandler()();
            finishLogout({ message: 'Logged out' });
            await pending;

            expect(assign).not.toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith('/');
        });

        it('redirects again when logout failed and the session later expires', async () => {
            vi.mocked(clientPost).mockRejectedValueOnce(new Error('network'));
            const { result } = mountKeeperAndLogout();

            await expect(result.current.mutateAsync()).rejects.toThrow('network');
            expiryHandler()();

            expect(assign).toHaveBeenCalledTimes(1);
        });
    });
    describe('authKeys', () => {
        it('should have correct key structure', () => {
            expect(authKeys.all).toEqual(['auth']);
            expect(authKeys.me()).toEqual(['auth', 'me']);
        });
    });
});