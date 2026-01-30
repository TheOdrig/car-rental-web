import type { RentalStatus } from '@/entities/rental';

export interface RentalFilter {
    status?: RentalStatus;
    startDate?: string;
    endDate?: string;
    carId?: number;
    userId?: number;
}

export type RentalAction =
    | 'approve'
    | 'reject'
    | 'pickup'
    | 'return'
    | 'cancel';

export interface RentalActionRequest {
    rentalId: number;
    action: RentalAction;
    notes?: string;
    reason?: string;
}

export interface RentalListItem {
    id: number;
    carName: string;
    userName: string;
    startDate: string;
    endDate: string;
    status: RentalStatus;
    totalPrice: number;
    currency: string;
}

export interface PaginatedRentals {
    rentals: RentalListItem[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
