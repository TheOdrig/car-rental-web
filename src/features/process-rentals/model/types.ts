



import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { ProcessReturnData } from '@/entities/rental';

export type { ProcessReturnData };

export type EarlyReturnPreview = WithRequired<Schemas['EarlyReturnPreview'], 'rentalId' | 'amount' | 'currency' | 'unusedDays'>;

export interface QuickActionResult {
    success: boolean;
    message: string;
    newStatus?: string;
    updatedSummary?: unknown;
}


export interface ApproveRentalRequest {
    rentalId: number;
    notes?: string;
}

export interface RejectRentalRequest {
    rentalId: number;
    reason: string;
}

export interface ProcessPickupRequest {
    rentalId: number;
    notes?: string;
}

export interface ProcessReturnRequest {
    rentalId: number;
    data?: string | ProcessReturnData;
}


export type { RentalDetailResponse } from '@/entities/rental';