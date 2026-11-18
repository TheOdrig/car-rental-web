export { AdminSidebar } from './admin-sidebar';
export { MetricsCard, MetricsCardSkeleton } from './metrics-card';

export type { } from './metrics-card';

export { DashboardMetricsGrid } from './metrics-card';
export { DashboardHeader } from './dashboard-header';
export { FleetStatusCard, FleetStatusCompact, FleetStatusSkeleton } from '@/features/manage-fleet/ui';
export { FleetStatsCards, FleetStatsCardsSkeleton } from '@/features/manage-fleet/ui';
export { FleetTable, FleetTableSkeleton } from '@/features/manage-fleet/ui';
export { UserStatsCards, UserStatsCardsSkeleton } from '@/features/manage-users/ui/user-stats';
export { UserTable, UserTableSkeleton } from '@/features/manage-users/ui/user-table';
export { PendingRentalsTable, PendingRentalsSkeleton } from '@/features/process-rentals/ui';
export { QuickActionsCard, QuickActionItem, QuickActionsSkeleton } from './quick-actions';
export { RevenueChart, RevenueChartSkeleton } from './revenue-chart';
export { AlertsPanel } from './alerts-panel';
export { ApproveRentalDialog } from '@/features/process-rentals/ui';
export { ProcessPickupDialog } from '@/features/process-rentals/ui';
export { ProcessReturnDialog } from '@/features/process-rentals/ui';
export { RejectRentalDialog } from '@/features/process-rentals/ui';

export { DamageStatusBadge, DamageSeverityBadge } from '@/entities/damage';
export { DamageTable } from './damage-table';
export { DamageFilters } from './damage-filters';
export { DamagePhotoUpload } from './damage-photo-upload';
export { DamageAssessDialog } from './damage-assess-dialog';
export { DamageResolveDialog } from './damage-resolve-dialog';
export { VehicleDamageHistory } from './vehicle-damage-history';
export { CustomerDamageHistory } from './customer-damage-history';

export { LateReturnsTable } from './late-returns-table';
export { LateReturnFilters } from './late-return-filters';
export { LateReturnStats } from './late-return-stats';
export { PenaltyWaiveDialog } from './penalty-waive-dialog';
export { PenaltyHistorySection } from './penalty-history-section';

export { ComingSoonPlaceholder } from './coming-soon-placeholder';
export { DetailPageSkeleton, CardSkeleton, TableSkeleton } from './detail-page-skeleton';
export { DetailPageError } from './detail-page-error';

export {
    RentalInfoCard,
    CustomerInfoCard,
    VehicleInfoCard,
    PaymentInfoCard,
    TimelineCard,
    RentalActionButtons,
} from '@/features/process-rentals/ui';

export {
    VehicleDetailInfoCard,
    VehicleImagesCard,
    VehicleStatisticsCard,
    VehicleStatusCard,
    VehicleActiveRentalCard,
    VehicleRentalHistoryTable,
} from '@/features/manage-fleet/ui/vehicle-detail';

export {
    CustomerDetailInfoCard,
    CustomerVerificationCard,
    CustomerStatisticsCard,
    CustomerStatusCard,
    CustomerRentalHistoryTable,
    CustomerNotesCard,
    BanCustomerDialog,
    UnbanCustomerDialog,
} from '@/features/manage-users/ui/customer-detail';

export { BasicInfoSection } from '@/features/manage-fleet/ui/car-form';
export { SpecificationsSection } from '@/features/manage-fleet/ui/car-form';
export { PricingSection } from '@/features/manage-fleet/ui/car-form';
export { ImagesSection } from '@/features/manage-fleet/ui/car-form';
export type { CarFormData } from '@/features/manage-fleet/model/types';
export { defaultCarFormData } from '@/features/manage-fleet/model/types';
export type { CarStatus } from '@/entities/car';