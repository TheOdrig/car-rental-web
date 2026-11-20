export { DamageCard, DamageCardSkeleton } from './ui/damage-card';
export { DamageList } from './ui/damage-list';
export { DamageDisputeForm } from './ui/damage-dispute-form';
export { DamageReportForm } from './ui/damage-report-form';
export { DamagePhotoUpload } from './ui/damage-photo-upload';
export { DamageAssessDialog } from './ui/damage-assess-dialog';
export { DamageResolveDialog } from './ui/damage-resolve-dialog';
export { DamageChargeDialog } from './ui/damage-charge-dialog';

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
} from '@/entities/damage';

export {
    useDisputeDamage,
    useCreateDamage,
    useUploadPhotos,
    useDeletePhoto,
    useAssessDamage,
    useReassessDamage,
    useResolveDamage,
    useChargeDamage,
} from './api/damage-mutations';
