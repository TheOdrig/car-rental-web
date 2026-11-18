import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, handleAuthError } from '@/features/auth/api/auth-api';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api';
import { createMockLoginRequest, createMockRegisterRequest, createMockAuthResponse } from './fixtures';

vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual('@/shared/api');
    return {
        ...actual,
        apiClient: {
            post: vi.fn(),
        },
    };
});

describe('Auth API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should call apiClient.post with correct params', async () => {
            const mockData = createMockLoginRequest();
            const mockResponse = createMockAuthResponse();

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await login(mockData);

            expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', mockData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('register', () => {
        it('should call apiClient.post with correct params', async () => {
            const mockData = createMockRegisterRequest();
            const mockResponse = createMockAuthResponse();

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await register(mockData);

            expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', mockData);
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