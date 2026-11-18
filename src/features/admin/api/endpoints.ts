export const ADMIN_ENDPOINTS = {
    dashboard: {
        summary: `/api/admin/dashboard/summary`,
        fleet: `/api/admin/dashboard/fleet`,
        metrics: `/api/admin/dashboard/metrics`,
        revenue: `/api/admin/dashboard/revenue`,
        pending: {
            approvals: `/api/admin/dashboard/pending/approvals`,
            pickups: `/api/admin/dashboard/pending/pickups`,
            returns: `/api/admin/dashboard/pending/returns`,
            overdue: `/api/admin/dashboard/pending/overdue`,
        },
    },
    alerts: `/api/admin/alerts`,
    acknowledgeAlert: (id: number) => `/api/admin/alerts/${id}/acknowledge`,
    quickActions: {
        approve: (id: number) => `/api/admin/quick-actions/rentals/${id}/approve`,
        reject: (id: number) => `/api/admin/quick-actions/rentals/${id}/reject`,
        pickup: (id: number) => `/api/admin/quick-actions/rentals/${id}/pickup`,
        return: (id: number) => `/api/admin/quick-actions/rentals/${id}/return`,
    },
    lateReturns: `/api/admin/late-returns`,
    lateReturnStatistics: `/api/admin/late-returns/statistics`,
    penaltyWaive: (id: number) => `/api/admin/rentals/${id}/penalty/waive`,
    penaltyHistory: (id: number) => `/api/admin/rentals/${id}/penalty/history`,
    users: {
        list: `/api/admin/users`,
        stats: `/api/admin/users/stats`,
        byId: (id: number) => `/api/admin/users/${id}`,
        ban: (id: number) => `/api/admin/users/${id}/ban`,
        unban: (id: number) => `/api/admin/users/${id}/unban`,
        notes: (id: number) => `/api/admin/users/${id}/notes`,
    },
} as const;