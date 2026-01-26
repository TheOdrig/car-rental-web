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

export function getDamageStatusColor(status: DamageStatus): string {
    const colors: Record<DamageStatus, string> = {
        REPORTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        UNDER_ASSESSMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        ASSESSED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        CHARGED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        RESOLVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[status];
}

export function getDamageSeverityColor(severity: DamageSeverity): string {
    const colors: Record<DamageSeverity, string> = {
        MINOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        MODERATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        MAJOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        TOTAL_LOSS: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[severity];
}

export function getDamageCategoryLabel(category: DamageCategory): string {
    const labels: Record<DamageCategory, string> = {
        SCRATCH: 'Scratch',
        DENT: 'Dent',
        GLASS_DAMAGE: 'Glass Damage',
        TIRE_DAMAGE: 'Tire Damage',
        INTERIOR_DAMAGE: 'Interior Damage',
        MECHANICAL_DAMAGE: 'Mechanical Damage',
    };
    return labels[category];
}

export function getDamageStatusLabel(status: DamageStatus): string {
    const labels: Record<DamageStatus, string> = {
        REPORTED: 'Reported',
        UNDER_ASSESSMENT: 'Under Assessment',
        ASSESSED: 'Assessed',
        CHARGED: 'Charged',
        DISPUTED: 'Disputed',
        RESOLVED: 'Resolved',
    };
    return labels[status];
}

export function getDamageSeverityLabel(severity: DamageSeverity): string {
    const labels: Record<DamageSeverity, string> = {
        MINOR: 'Minor',
        MODERATE: 'Moderate',
        MAJOR: 'Major',
        TOTAL_LOSS: 'Total Loss',
    };
    return labels[severity];
}

