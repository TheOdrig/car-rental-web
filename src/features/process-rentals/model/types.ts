

import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { ProcessReturnData } from '@/entities/rental';

export type { ProcessReturnData };

export type EarlyReturnPreview = WithRequired<Schemas['EarlyReturnPreview'], 'rentalId' | 'amount' | 'currency' | 'unusedDays'>;

export type QuickActionResult = WithRequired<Schemas['QuickActionResultDto'], 'success' | 'message'>;

export type ApproveRentalRequest = Schemas['QuickApproveRequest'] & { rentalId: number };

export type RejectRentalRequest = Schemas['RejectRequest'] & { rentalId: number };

export type ProcessPickupRequest = Schemas['QuickPickupRequest'] & { rentalId: number };

export interface ProcessReturnRequest {
    rentalId: number;
    data?: string | ProcessReturnData;
}

export type { RentalDetailResponse } from '@/entities/rental';