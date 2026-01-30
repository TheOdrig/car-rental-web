export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface User {
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    avatarUrl?: string;
}

