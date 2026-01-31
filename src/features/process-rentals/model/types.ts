



export interface QuickActionResult {
    success: boolean;
    message: string;
    newStatus?: string;
    updatedSummary?: unknown;
}

export interface ProcessReturnData {
    hasDamage?: boolean;
    notes?: string;
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