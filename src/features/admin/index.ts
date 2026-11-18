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


export * from './ui';

export { adminKeys, type PendingFilters, type AdminCarsFilters } from '@/shared/api';

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