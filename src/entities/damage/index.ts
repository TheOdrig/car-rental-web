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
export { damageStatusPresentation, damageSeverityPresentation } from './model/status-presentation';
export { DAMAGE_STATUSES, DAMAGE_SEVERITIES, DAMAGE_CATEGORIES } from './model/types';

export {
    getDamageCategoryLabel,
    getDamageStatusLabel,
    getDamageSeverityLabel,
} from './lib/utils';

export {
    canAssessDamage,
    canReassessDamage,
    canResolveDamageDispute,
    canChargeDamage,
    canDisputeDamage,
    hasDisputeActivity,
} from './lib/damage-rules';

export {
    useDamages,
    useDamageDetail,
    useInvalidateDamages,
    useMyDamages,
    useMyDamageDetail,
    useDamageStatistics,
    useVehicleDamages,
    useCustomerDamages,
    damageKeys,
} from './api/damage-queries';
export { DamageStatusBadge } from './ui/damage-status-badge';
export { DamageSeverityBadge } from './ui/damage-severity-badge';
export { DamageCurrencyTotals } from './ui/damage-currency-totals';
