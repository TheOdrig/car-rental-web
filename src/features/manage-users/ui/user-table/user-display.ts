import { personDisplayName } from '@/shared/lib';
import { DEFAULT_ACCOUNT_STATUS } from '@/entities/user';
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
        dotColor: 'bg-primary',
        textColor: 'text-primary-subtle-foreground',
    },
    CUSTOMER: {
        label: 'Customer',
        dotColor: 'bg-info',
        textColor: 'text-info-subtle-foreground',
    },
    SUPPORT: {
        label: 'Support',
        dotColor: 'bg-muted-foreground',
        textColor: 'text-neutral-subtle-foreground',
    },
};

export const STATUS_CONFIG: Record<UserStatus, DisplayConfig> = {
    ACTIVE: {
        label: 'Active',
        dotColor: 'bg-success',
        textColor: 'text-success-subtle-foreground',
    },
    PENDING: {
        label: 'Pending',
        dotColor: 'bg-warning',
        textColor: 'text-warning-subtle-foreground',
    },
    BANNED: {
        label: 'Banned',
        dotColor: 'bg-destructive',
        textColor: 'text-danger-subtle-foreground',
    },
};

export function getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '??';
}

export function getDisplayName(firstName?: string, lastName?: string, email?: string): string {
    return personDisplayName({ firstName, lastName, email }, 'Unknown User');
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
    return (user.status?.toUpperCase() || DEFAULT_ACCOUNT_STATUS) as UserStatus;
}

export const NEVER_LOGGED_IN_LABEL = 'Never logged in';
