import { describe, it, expect } from 'vitest';
import { type User, UserRole, isAdmin, getDisplayName, getInitials } from '@/entities/user';
const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: [UserRole.USER],
};
const mockAdmin: User = {
    id: 2,
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    roles: [UserRole.USER, UserRole.ADMIN],
};
const mockUserNoName: User = {
    id: 3,
    email: 'noname@example.com',
    username: '',
    roles: [UserRole.USER],
};
describe('User Entity', () => {
    describe('Utils', () => {
        describe('isAdmin', () => {
            it('should return true for admin user', () => {
                expect(isAdmin(mockAdmin)).toBe(true);
            });
            it('should return false for regular user', () => {
                expect(isAdmin(mockUser)).toBe(false);
            });
            it('should return false for null user', () => {
                expect(isAdmin(null)).toBe(false);
            });
        });
        describe('getDisplayName', () => {
            it('should return name if available', () => {
                expect(getDisplayName(mockUser)).toBe('Test User');
            });
            it('should return email if name is empty', () => {
                expect(getDisplayName(mockUserNoName)).toBe('noname@example.com');
            });
            it('should return Guest if user is null', () => {
                expect(getDisplayName(null)).toBe('Guest');
            });
        });
        describe('getInitials', () => {
            it('should return initials from name', () => {
                expect(getInitials(mockUser)).toBe('TU');
            });
            it('should return initials from email if name is missing', () => {
                expect(getInitials(mockUserNoName)).toBe('NO');
            });
            it('should return ? if user is null', () => {
                expect(getInitials(null)).toBe('?');
            });
        });
    });
});