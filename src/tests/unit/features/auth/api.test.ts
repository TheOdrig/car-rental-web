import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, handleAuthError } from '@/features/auth/api/auth-api';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api/error';

vi.mock('@/shared/api', () => ({
    apiClient: {
        post: vi.fn(),
    },
    ApiError: class extends Error {
        status: number;
        constructor(status: number, message: string) {
            super(message);
            this.status = status;
        }
    },
}));

describe('Auth API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should call apiClient.post with correct params', async () => {
            const mockData = { email: 'test@example.com', password: 'password' };
            const mockResponse = { token: 'token', user: { id: 1, email: 'test@example.com' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await login(mockData);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', mockData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('register', () => {
        it('should call apiClient.post with correct params', async () => {
            const mockData = {
                email: 'test@example.com',
                password: 'password',
                name: 'Test User',
                phone: '1234567890'
            };
            const mockResponse = { token: 'token', user: { id: 1, email: 'test@example.com' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await register(mockData);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/register', mockData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('handleAuthError', () => {
        it('should return invalid credentials message for 401', () => {
            const error = new ApiError(401, 'Unauthorized');
            expect(handleAuthError(error)).toBe('Invalid credentials');
        });

        it('should return email exists message for 409', () => {
            const error = new ApiError(409, 'Conflict');
            expect(handleAuthError(error)).toBe('Email already exists');
        });

        it('should return generic message for other errors', () => {
            const error = new Error('Random error');
            expect(handleAuthError(error)).toBe('Authentication failed');
        });
    });
});
