import type { AuthResponse, LoginRequest, RegisterRequest } from '@/features/auth';

export const createMockUser = (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    roles: [],
    ...overrides,
});

export const createMockAuthResponse = (overrides = {}): AuthResponse => ({
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456',
    tokenType: 'Bearer',
    expiresIn: 3600,
    username: 'testuser',
    ...overrides,
});

export const createMockLoginRequest = (overrides = {}): LoginRequest => ({
    username: 'testuser',
    password: 'password123',
    ...overrides,
});

export const createMockRegisterRequest = (overrides = {}): RegisterRequest => ({
    username: 'newuser',
    email: 'new@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User',
    ...overrides,
});
