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
    TimelineEventType,
    TimelineEvent,
    AdminRentalStatus,
    RentalDetailResponse,
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

export * from './lib/use-late-returns';
export * from './lib/utils';