import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '@/features/auth';

describe('password length follows the API contract', () => {
    it('rejects 7 characters and accepts 8 on login', () => {
        expect(LoginSchema.safeParse({ username: 'alice', password: '1234567' }).success).toBe(false);
        expect(LoginSchema.safeParse({ username: 'alice', password: '12345678' }).success).toBe(true);
    });

    it('rejects 7 characters and accepts 8 on register', () => {
        const base = { username: 'alice', email: 'alice@example.com' };

        expect(RegisterSchema.safeParse({ ...base, password: '1234567' }).success).toBe(false);
        expect(RegisterSchema.safeParse({ ...base, password: '12345678' }).success).toBe(true);
    });

    it('rejects more than 72 characters or 72 UTF-8 bytes', () => {
        const base = { username: 'alice', email: 'alice@example.com' };

        expect(LoginSchema.safeParse({ username: 'alice', password: 'a'.repeat(72) }).success).toBe(true);
        expect(LoginSchema.safeParse({ username: 'alice', password: 'a'.repeat(73) }).success).toBe(false);
        expect(RegisterSchema.safeParse({ ...base, password: 'a'.repeat(73) }).success).toBe(false);
        expect(RegisterSchema.safeParse({ ...base, password: 'ü'.repeat(37) }).success).toBe(false);
        expect(RegisterSchema.safeParse({ ...base, password: 'ü'.repeat(36) }).success).toBe(true);
    });
});
