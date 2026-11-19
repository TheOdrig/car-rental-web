export type {
    DamageStatus,
    DamageSeverity,
    DamageCategory,
    DamagePhoto,
    DamageReport,
    DamageReportRequest,
    DamageAssessmentRequest,
    DamageDisputeRequest,
    DamageDisputeResolution,
    DamageChargeResult,
    DamageSearchFilters,
    DamageStatistics,
    DamageListResponse,
} from './model/types';
export { DAMAGE_STATUSES, DAMAGE_SEVERITIES, DAMAGE_CATEGORIES } from './model/types';


export {
    getDamageStatusColor,
    getDamageSeverityColor,
    getDamageCategoryLabel,
    getDamageStatusLabel,
    getDamageSeverityLabel,
} from './lib/utils';

export {
    useDamages,
    useDamageDetail,
    useDisputeDamage,
    useCreateDamage,
    useUploadPhotos,
    useDeletePhoto,
    useAssessDamage,
    useReassessDamage,
    useResolveDamage,
    useChargeDamage,
    useInvalidateDamages,
    useMyDamages,
    useMyDamageDetail,
    useDamageStatistics,
    useVehicleDamages,
    useCustomerDamages,
    damageKeys,
} from './lib/use-damages';
export { DamageStatusBadge } from './ui/damage-status-badge';
export { DamageSeverityBadge } from './ui/damage-severity-badge';
export { DamageReportForm } from './ui/damage-report-form';
export { DamageCurrencyTotals } from './ui/damage-currency-totals';
