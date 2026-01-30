import { useUserStore } from '@/entities/user';
import { login as loginApi, register as registerApi, logout as logoutApi, handleAuthError } from '../api/auth-api';
import { LoginRequest, RegisterRequest } from './types';

export const authActions = {
    async login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await loginApi(credentials);

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', response.accessToken);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: handleAuthError(error) };
        }
    },

    async register(data: RegisterRequest): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await registerApi(data);

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', response.accessToken);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: handleAuthError(error) };
        }
    },

    async logout(): Promise<void> {
        try {
            await logoutApi();
        } catch {

        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
            }

            useUserStore.getState().logout();
        }
    },
};
