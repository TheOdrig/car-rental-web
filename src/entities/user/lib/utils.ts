import { User, UserRole } from '../model/types';

export const isAdmin = (user: User | null): boolean => {
    return user?.roles.includes(UserRole.ADMIN) ?? false;
};

export const getDisplayName = (user: User | null): string => {
    if (!user) return 'Guest';

    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.username || user.email;
};

export const getInitials = (user: User | null): string => {
    if (!user) return '?';

    if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    const displayName = user.firstName || user.lastName || user.username || user.email;

    if (displayName.includes(' ')) {
        return displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return displayName.slice(0, 2).toUpperCase();
};