export type DamageStatus =
    | 'REPORTED'
    | 'UNDER_ASSESSMENT'
    | 'ASSESSED'
    | 'CHARGED'
    | 'DISPUTED'
    | 'RESOLVED';

export type DamageSeverity =
    | 'MINOR'
    | 'MODERATE'
    | 'MAJOR'
    | 'TOTAL_LOSS';

export type DamageCategory =
    | 'SCRATCH'
    | 'DENT'
    | 'GLASS_DAMAGE'
    | 'TIRE_DAMAGE'
    | 'INTERIOR_DAMAGE'
    | 'MECHANICAL_DAMAGE';

export interface DamagePhoto {
    id: number;
    fileName: string;
    secureUrl: string;
    fileSize: number;
    uploadedAt: string;
}

export interface DamageReport {
    id: number;
    rentalId: number;
    carId: number;
    carLicensePlate: string;
    customerName: string;
    description: string;
    damageLocation?: string;
    severity: DamageSeverity;
    category: DamageCategory;
    status: DamageStatus;
    repairCostEstimate?: number;
    customerLiability?: number;
    insuranceCoverage?: boolean;
    reportedAt: string;
    assessedAt?: string;
    photos: DamagePhoto[];
}

export interface DamageReportRequest {
    description: string;
    damageLocation?: string;
    initialSeverity?: DamageSeverity;
    category?: DamageCategory;
}

export interface DamageAssessmentRequest {
    severity: DamageSeverity;
    category: DamageCategory;
    repairCostEstimate: number;
    insuranceCoverage?: boolean;
    insuranceDeductible?: number;
    assessmentNotes?: string;
}

export interface DamageDisputeRequest {
    reason: string;
    comments?: string;
}

export interface DamageDisputeResolution {
    adjustedRepairCost: number;
    adjustedCustomerLiability: number;
    resolutionNotes: string;
}

export interface DamageSearchFilters {
    startDate?: string;
    endDate?: string;
    severity?: DamageSeverity;
    category?: DamageCategory;
    status?: DamageStatus;
    carId?: number;
}

export interface DamageStatistics {
    totalDamages: number;
    minorCount: number;
    moderateCount: number;
    majorCount: number;
    totalLossCount: number;
    totalRepairCost: number;
    totalCustomerLiability: number;
    averageRepairCost: number;
    disputedCount: number;
    resolvedCount: number;
}

export interface DamageListResponse {
    content: DamageReport[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
