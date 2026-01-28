import { User, UserRole } from '../model/types';

export const isAdmin = (user: User | null): boolean => {
    return user?.roles.includes(UserRole.ADMIN) ?? false;
};

export const getDisplayName = (user: User | null): string => {
    if (!user) return 'Guest';
    return user.name || user.email;
};

export const getInitials = (user: User | null): string => {
    if (!user) return '?';
    const name = user.name || user.email;
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
