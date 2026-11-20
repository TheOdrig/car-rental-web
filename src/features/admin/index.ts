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
    RevenueCurrency,
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
} from './api/use-admin-dashboard';

export * from './api/use-late-returns';
export { useRefreshExchangeRates } from './api/use-refresh-rates';
export * from './lib/utils';