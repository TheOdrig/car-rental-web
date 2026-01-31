import type { User, UserSummary, Role } from '../../model/types';

let userIdCounter = 1;

export function createMockUserSummary(overrides?: Partial<UserSummary>): UserSummary {
    const id = userIdCounter++;
    return {
        id,
        username: `user${id}`,
        email: `user${id}@example.com`,
        ...overrides,
    };
}

export function createMockUser(overrides?: Partial<User>): User {
    const id = userIdCounter++;
    return {
        id,
        username: `user${id}`,
        email: `user${id}@example.com`,
        firstName: 'Test',
        lastName: `User${id}`,
        roles: ['USER'] as Role[],
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockAdmin(overrides?: Partial<User>): User {
    return createMockUser({
        roles: ['ADMIN'] as Role[],
        firstName: 'Admin',
        ...overrides,
    });
}

export function resetUserCounters() {
    userIdCounter = 1;
}
