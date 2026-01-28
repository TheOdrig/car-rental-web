import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authActions } from '@/features/auth/model/store';
import * as authApi from '@/features/auth/api/auth-api';
import { useUserStore } from '@/entities/user';

vi.mock('@/features/auth/api/auth-api');
vi.mock('@/entities/user');

const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

void mockLocalStorage.removeItem;

describe('Auth Store', () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', roles: [] };
    const mockToken = 'mock-token-123';

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.clear();
    });

    describe('login', () => {
        it('should successfully login and store token', async () => {
            const mockSetUser = vi.fn();
            (authApi.login as any).mockResolvedValue({ token: mockToken, user: mockUser });
            (useUserStore.getState as any).mockReturnValue({ setUser: mockSetUser });

            const result = await authActions.login({
                email: 'test@example.com',
                password: 'password'
            });

            expect(result.success).toBe(true);
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password',
            });
            expect(mockLocalStorage.getItem('accessToken')).toBe(mockToken);
            expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        });

        it('should handle login failure', async () => {
            const mockSetUser = vi.fn();
            (authApi.login as any).mockRejectedValue(new Error('Login failed'));
            (authApi.handleAuthError as any).mockReturnValue('Invalid credentials');
            (useUserStore.getState as any).mockReturnValue({ setUser: mockSetUser });

            const result = await authActions.login({
                email: 'test@example.com',
                password: 'wrong'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should successfully register and store token', async () => {
            const mockSetUser = vi.fn();
            (authApi.register as any).mockResolvedValue({ token: mockToken, user: mockUser });
            (useUserStore.getState as any).mockReturnValue({ setUser: mockSetUser });

            const result = await authActions.register({
                email: 'new@example.com',
                password: 'password',
                name: 'New User',
                phone: '1234567890'
            });

            expect(result.success).toBe(true);
            expect(mockLocalStorage.getItem('accessToken')).toBe(mockToken);
            expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        });

        it('should handle register failure', async () => {
            const mockSetUser = vi.fn();
            (authApi.register as any).mockRejectedValue(new Error('Registration failed'));
            (authApi.handleAuthError as any).mockReturnValue('Email already exists');
            (useUserStore.getState as any).mockReturnValue({ setUser: mockSetUser });

            const result = await authActions.register({
                email: 'existing@example.com',
                password: 'password',
                name: 'User',
                phone: '1234567890'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email already exists');
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should clear token and user state', async () => {
            const mockLogout = vi.fn();
            mockLocalStorage.setItem('accessToken', mockToken);

            (authApi.logout as any).mockResolvedValue(undefined);
            (useUserStore.getState as any).mockReturnValue({ logout: mockLogout });

            await authActions.logout();

            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockLogout).toHaveBeenCalled();
        });

        it('should clear state even if API call fails', async () => {
            const mockLogout = vi.fn();
            mockLocalStorage.setItem('accessToken', mockToken);

            (authApi.logout as any).mockRejectedValue(new Error('Logout failed'));
            (useUserStore.getState as any).mockReturnValue({ logout: mockLogout });

            await authActions.logout();

            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});
