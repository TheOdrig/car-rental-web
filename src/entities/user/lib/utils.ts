import { personDisplayName } from '@/shared/lib/person-name';
import { type AccountStatusType, User, UserRole } from '../model/types';

export const hasAdminRole = (roles: readonly string[] | null | undefined): boolean => {
    return roles?.includes(UserRole.ADMIN) ?? false;
};

export const isAdmin = (user: User | null): boolean => hasAdminRole(user?.roles);

export const getDisplayName = (user: User | null): string => {
    if (!user) return 'Guest';

    return personDisplayName(user);
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

export const isBannedAccount = (accountStatus: { status: AccountStatusType }): boolean => accountStatus.status === 'BANNED';

export const isActiveAccount = (accountStatus: { status: AccountStatusType }): boolean => accountStatus.status === 'ACTIVE';
