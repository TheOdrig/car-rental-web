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
    DamageSearchFilters,
    DamageStatistics,
    DamageListResponse,
} from './model/types';


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
    useResolveDamage,
    useInvalidateDamages,
    useMyDamages,
    useDamageStatistics,
    useVehicleDamages,
    useCustomerDamages,
    damageKeys,
} from './lib/use-damages';
export { DamageStatusBadge } from './ui/damage-status-badge';
export { DamageSeverityBadge } from './ui/damage-severity-badge';
export { DamageReportForm } from './ui/damage-report-form';
export { DamageCurrencyTotals } from './ui/damage-currency-totals';
