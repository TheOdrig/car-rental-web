import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { PageResponse } from '@/shared/types';

export type DamageStatus = NonNullable<Schemas['DamageReportResponse']['status']>;

export type DamageSeverity = NonNullable<Schemas['DamageReportResponse']['severity']>;

export type DamageCategory = NonNullable<Schemas['DamageReportResponse']['category']>;

export type DamagePhoto = WithRequired<
    Schemas['DamagePhotoDto'],
    'id' | 'fileName' | 'secureUrl' | 'fileSize' | 'uploadedAt'
>;

export type DamageReport = Omit<
    WithRequired<
        Schemas['DamageReportResponse'],
        | 'id'
        | 'rentalId'
        | 'carId'
        | 'carLicensePlate'
        | 'customerName'
        | 'description'
        | 'severity'
        | 'category'
        | 'status'
        | 'reportedAt'
    >,
    'photos'
> & { photos: DamagePhoto[] };

export type DamageReportRequest = Schemas['DamageReportRequest'];

export type DamageAssessmentRequest = Schemas['DamageAssessmentRequest'];

export type DamageDisputeRequest = Schemas['DamageDisputeRequest'];

export type DamageDisputeResolution = Schemas['DamageDisputeResolutionDto'];

export interface DamageSearchFilters {
    startDate?: string;
    endDate?: string;
    severity?: DamageSeverity;
    category?: DamageCategory;
    status?: DamageStatus;
    carId?: number;
}

export type DamageStatistics = Required<Schemas['DamageStatisticsDto']>;

export type DamageListResponse = PageResponse<DamageReport>;