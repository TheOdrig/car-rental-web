export type {
    TrendIndicator,
    DailySummary,
    FleetStatus,
    MonthlyMetrics,
    AlertType,
    AlertSeverity,
    Alert,
    PendingItem,
    QuickActionResult,
    ProcessReturnData,
    DailyRevenue,
    MonthlyRevenue,
    RevenueBreakdown,
    RevenuePeriod,
    RevenueDataPoint,
    RevenueAnalytics,
    AlertVariant,
    AdminAlertAction,
    AdminAlert,
    CustomerStatistics,
    CustomerVerification,
    CustomerAccountStatus,
    AccountStatusType,
    DocumentVerificationStatus,
    AdminNote,
    CustomerDetailResponse,
    VehicleStatistics,
    VehicleImages,
    VehicleCurrentStatus,
    VehicleActiveRental,
    VehicleDetailResponse,
    RentalVehicleInfo,
    RentalCustomerInfo,
    RentalPricing,
    RentalPaymentInfo,
    TimelineEventType,
    TimelineEvent,
    AdminRentalStatus,
    RentalHistoryItem,
    PaginatedResponse,
    RentalDetailResponse,
    Role,
} from './model/types';

export { ADMIN_ENDPOINTS } from './api/endpoints';

export * from './ui';

export { adminKeys } from './lib/admin-keys';
export type { PendingFilters, AdminCarsFilters } from './lib/admin-keys';

export {
    useDashboardSummary,
    useFleetStatus,
    usePendingApprovals,
    usePendingPickups,
    usePendingReturns,
    useOverdueRentals,
    useRevenueData,
    useAlerts,
    useDismissAlert,
    useMarkAllAlertsRead,
    useInvalidateAdmin,
} from './lib/use-admin-dashboard';

export {
    useApproveRental,
    useProcessPickup,
    useProcessReturn,
    useRejectRental,
    useRentalDetail,
} from './lib/use-admin-rentals';

export {
    useAdminCars,
    useCreateCar,
    useUpdateCar,
    useDeleteCar,
    useUpdateCarStatus,
    useVehicleDetail,
    useVehicleRentalHistory,
} from './lib/use-admin-vehicles';
export type { CreateCarRequest, UpdateCarRequest, CarResponse } from './lib/use-admin-vehicles';

export {
    useCustomerDetail,
    useCustomerRentalHistory,
    useBanCustomer,
    useUnbanCustomer,
    useAddAdminNote,
} from './lib/use-admin-customers';

export * from './lib/use-fleet';
export * from './lib/use-users';
export * from './lib/use-late-returns';
export * from './lib/use-car-form';
export * from './lib/utils';
