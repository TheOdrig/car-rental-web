import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { PageResponse } from '@/shared/types';





export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';
export type AccountStatusType = 'ACTIVE' | 'BANNED' | 'LOCKED' | 'PENDING';
export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';
export type Role = 'USER' | 'ADMIN';
export type AdminRentalStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'OVERDUE';





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





export interface BanUserRequest {
    userId: number;
    reason: string;
    displayName?: string;
}

export interface UnbanUserRequest {
    userId: number;
    note?: string;
    displayName?: string;
}

export interface AddNoteRequest {
    userId: number;
    text: string;
}