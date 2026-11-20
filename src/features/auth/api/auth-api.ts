import { apiClient, ApiError } from '@/shared/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../model/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.auth.login, data);
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.auth.register, data);
};

export const logout = async (): Promise<void> => {
};

export const handleAuthError = (error: unknown): string => {
    if (error instanceof ApiError) {
        if (error.status === 401) return 'Invalid credentials';
        if (error.status === 409) return 'Email already exists';
    }
    return 'Authentication failed';
};