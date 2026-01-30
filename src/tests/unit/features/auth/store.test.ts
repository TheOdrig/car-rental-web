import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authActions } from '@/features/auth/model/store';
import * as authApi from '@/features/auth/api/auth-api';
import { useUserStore } from '@/entities/user';
import { createMockUser, createMockAuthResponse, createMockLoginRequest, createMockRegisterRequest } from './fixtures';

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
    const mockUser = createMockUser();
    const mockAuthResponse = createMockAuthResponse();
    const mockToken = mockAuthResponse.accessToken;

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.clear();
    });

    describe('login', () => {
        it('should successfully login and store token', async () => {
            const mockSetUser = vi.fn();
            const loginData = createMockLoginRequest();
            vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse);
            vi.mocked(useUserStore.getState).mockReturnValue({ setUser: mockSetUser } as unknown as ReturnType<typeof useUserStore.getState>);

            const result = await authActions.login(loginData);

            expect(result.success).toBe(true);
            expect(authApi.login).toHaveBeenCalledWith(loginData);
            expect(mockLocalStorage.getItem('accessToken')).toBe(mockToken);
        });

        it('should handle login failure', async () => {
            const mockSetUser = vi.fn();
            vi.mocked(authApi.login).mockRejectedValue(new Error('Login failed'));
            vi.mocked(authApi.handleAuthError).mockReturnValue('Invalid credentials');
            vi.mocked(useUserStore.getState).mockReturnValue({ setUser: mockSetUser } as unknown as ReturnType<typeof useUserStore.getState>);

            const result = await authActions.login(createMockLoginRequest({ password: 'wrong' }));

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should successfully register and store token', async () => {
            const mockSetUser = vi.fn();
            vi.mocked(authApi.register).mockResolvedValue(mockAuthResponse);
            vi.mocked(useUserStore.getState).mockReturnValue({ setUser: mockSetUser } as unknown as ReturnType<typeof useUserStore.getState>);

            const result = await authActions.register(createMockRegisterRequest());

            expect(result.success).toBe(true);
            expect(mockLocalStorage.getItem('accessToken')).toBe(mockToken);
        });

        it('should handle register failure', async () => {
            const mockSetUser = vi.fn();
            vi.mocked(authApi.register).mockRejectedValue(new Error('Registration failed'));
            vi.mocked(authApi.handleAuthError).mockReturnValue('Email already exists');
            vi.mocked(useUserStore.getState).mockReturnValue({ setUser: mockSetUser } as unknown as ReturnType<typeof useUserStore.getState>);

            const result = await authActions.register(createMockRegisterRequest({ email: 'existing@example.com' }));

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email already exists');
            expect(mockSetUser).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should clear token and user state', async () => {
            const mockLogout = vi.fn();
            mockLocalStorage.setItem('accessToken', mockToken);

            vi.mocked(authApi.logout).mockResolvedValue(undefined);
            vi.mocked(useUserStore.getState).mockReturnValue({ logout: mockLogout } as unknown as ReturnType<typeof useUserStore.getState>);

            await authActions.logout();

            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockLogout).toHaveBeenCalled();
        });

        it('should clear state even if API call fails', async () => {
            const mockLogout = vi.fn();
            mockLocalStorage.setItem('accessToken', mockToken);

            vi.mocked(authApi.logout).mockRejectedValue(new Error('Logout failed'));
            vi.mocked(useUserStore.getState).mockReturnValue({ logout: mockLogout } as unknown as ReturnType<typeof useUserStore.getState>);

            await authActions.logout();

            expect(mockLocalStorage.getItem('accessToken')).toBeNull();
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});
