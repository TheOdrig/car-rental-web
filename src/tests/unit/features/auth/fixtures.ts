import type { AuthResponse, LoginRequest, RegisterRequest } from '@/features/auth/model/types';

export const createMockUser = (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    roles: [],
    ...overrides,
});

export const createMockAuthResponse = (overrides = {}): AuthResponse => ({
    token: 'mock-token-123',
    user: createMockUser(),
    ...overrides,
});

export const createMockLoginRequest = (overrides = {}): LoginRequest => ({
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
});

export const createMockRegisterRequest = (overrides = {}): RegisterRequest => ({
    email: 'new@example.com',
    password: 'password123',
    name: 'New User',
    phone: '1234567890',
    ...overrides,
});
