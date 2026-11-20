import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { PageResponse } from '@/shared/types';
import type { AdminRentalStatus } from '@/entities/rental';
import type { AccountStatusType } from '@/entities/user';





export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';
export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';
export type Role = 'USER' | 'ADMIN';
export type { AdminRentalStatus, AccountStatusType };





export type User = Omit<
    WithRequired<Schemas['AdminUserListItem'], 'id' | 'email' | 'createdAt'>,
    'roles' | 'status' | 'isEmailVerified'
> & {
    roles: Role[];
    status: UserStatus;
    isEmailVerified: boolean;
};





export type UserStats = Required<Schemas['UserStatsResponse']>;

export type {
    CustomerStatistics,
    CustomerVerification,
    CustomerAccountStatus,
    AdminNote,
    CustomerDetailResponse,
} from '@/entities/user';





export interface RentalHistoryItem {
    id: number;
    customerId?: number;
    customerName: string;
    carId?: number;
    vehicleName: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    currency?: string;
    status: AdminRentalStatus;
}

export type PaginatedResponse<T> = PageResponse<T>;





export type BanUserRequest = Schemas['BanUserRequest'] & { userId: number; displayName?: string };

export type UnbanUserRequest = Schemas['UnbanUserRequest'] & { userId: number; displayName?: string };

export type AddNoteRequest = Schemas['AddNoteRequest'] & { userId: number };