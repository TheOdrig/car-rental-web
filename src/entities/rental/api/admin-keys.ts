export interface PendingFilters {
    page?: number;
    size?: number;
}

export const adminKeys = {
    all: ['admin'] as const,
    dashboard: () => [...adminKeys.all, 'dashboard'] as const,
    summary: () => [...adminKeys.dashboard(), 'summary'] as const,
    fleet: () => [...adminKeys.dashboard(), 'fleet'] as const,
    pending: () => [...adminKeys.dashboard(), 'pending'] as const,
    pendingApprovals: (filters?: PendingFilters) => [...adminKeys.pending(), 'approvals', filters] as const,
    pendingPickups: (filters?: PendingFilters) => [...adminKeys.pending(), 'pickups', filters] as const,
    pendingReturns: (filters?: PendingFilters) => [...adminKeys.pending(), 'returns', filters] as const,
    overdueRentals: (filters?: PendingFilters) => [...adminKeys.pending(), 'overdue', filters] as const,
    revenue: () => [...adminKeys.all, 'revenue'] as const,
    alerts: () => [...adminKeys.all, 'alerts'] as const,
};