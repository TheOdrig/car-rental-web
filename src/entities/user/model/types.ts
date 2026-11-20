import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { CurrencyType } from '@/shared/types';

export type Role = NonNullable<Schemas['UserDto']['roles']>[number];

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export type UserSummary = WithRequired<Schemas['UserSummaryResponse'], 'id' | 'username' | 'email'>;

export type User = Omit<WithRequired<Schemas['AdminUserListItem'], 'id' | 'email'>, 'roles'> & {
    username?: string;
    roles: Role[];
};

export type AuthResponse = WithRequired<
    Schemas['AuthResponse'],
    'accessToken' | 'refreshToken' | 'tokenType' | 'expiresIn' | 'username'
>;

export type RefreshTokenRequest = Schemas['RefreshTokenRequest'];

import type { ValidationState } from '@/shared/types/validation';

export interface ValidationDisplayProps {
    state: ValidationState;
    message?: string;
    showIcon?: boolean;
    className?: string;
}

export type UserProfile = Omit<WithRequired<Schemas['UserDto'], 'id' | 'username' | 'email'>, 'roles'> & {
    roles: Role[];
};

export type ProfileUpdateData = Schemas['ProfileUpdateRequest'];

export type AvatarUploadResponse = WithRequired<Schemas['AvatarUploadResponse'], 'avatarUrl' | 'message'>;

export type PasswordChangeData = Schemas['PasswordChangeRequest'];

export type SpentByCurrency = WithRequired<Schemas['RentalSpendTotals'], 'rentalCount' | 'totalSpent'> & {
    currency: CurrencyType;
};

export type CustomerStatistics = Omit<Required<Schemas['UserStatistics']>, 'spentByCurrency'> & {
    spentByCurrency: SpentByCurrency[];
};

export type CustomerVerification = Omit<Required<Schemas['VerificationInfo']>, 'documentsVerified'> & {
    documentsVerified: DocumentVerificationStatus;
};

export type CustomerAccountStatus = Omit<Schemas['AccountStatus'], 'status'> & { status: AccountStatusType };

export type AdminNote = WithRequired<Schemas['AdminNoteDto'], 'id' | 'text' | 'createdAt'>;

export type CustomerDetailResponse = Omit<
    WithRequired<Schemas['AdminUserDetailResponse'], 'id' | 'email'>,
    'roles' | 'statistics' | 'verification' | 'accountStatus' | 'adminNotes'
> & {
    roles: Role[];
    statistics: CustomerStatistics;
    verification: CustomerVerification;
    accountStatus: CustomerAccountStatus;
    adminNotes: AdminNote[];
};

export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';

export type AccountStatusType = 'ACTIVE' | 'BANNED' | 'LOCKED' | 'PENDING';
