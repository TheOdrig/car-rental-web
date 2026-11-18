import type { User, UserRole, UserStatus } from '../../model/types';

interface DisplayConfig {
    label: string;
    dotColor: string;
    textColor: string;
}

export interface UserForAction {
    id: number;
    name: string;
    status: UserStatus;
    banReason?: string;
}

export const ROLE_CONFIG: Record<UserRole, DisplayConfig> = {
    ADMIN: {
        label: 'Admin',
        dotColor: 'bg-purple-500',
        textColor: 'text-purple-700 dark:text-purple-400',
    },
    CUSTOMER: {
        label: 'Customer',
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
    },
    SUPPORT: {
        label: 'Support',
        dotColor: 'bg-cyan-500',
        textColor: 'text-cyan-700 dark:text-cyan-400',
    },
};

export const STATUS_CONFIG: Record<UserStatus, DisplayConfig> = {
    ACTIVE: {
        label: 'Active',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    PENDING: {
        label: 'Pending',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
    },
    BANNED: {
        label: 'Banned',
        dotColor: 'bg-red-500',
        textColor: 'text-red-700 dark:text-red-400',
    },
};

export function getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '??';
}

export function getDisplayName(firstName?: string, lastName?: string, email?: string): string {
    if (firstName || lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return email || 'Unknown User';
}

export function getPrimaryRole(roles: string[]): UserRole {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('SUPPORT')) return 'SUPPORT';
    return 'CUSTOMER';
}

export function resolveRoles(user: User): string[] {
    return user.roles;
}

export function resolveStatus(user: User): UserStatus {
    return (user.status?.toUpperCase() || 'ACTIVE') as UserStatus;
}
