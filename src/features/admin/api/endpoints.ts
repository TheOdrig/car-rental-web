const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const ADMIN_ENDPOINTS = {
    dashboard: {
        summary: `${API_BASE_URL}/api/admin/dashboard/summary`,
        fleet: `${API_BASE_URL}/api/admin/dashboard/fleet`,
        metrics: `${API_BASE_URL}/api/admin/dashboard/metrics`,
        revenue: `${API_BASE_URL}/api/admin/dashboard/revenue`,
        pending: {
            approvals: `${API_BASE_URL}/api/admin/dashboard/pending/approvals`,
            pickups: `${API_BASE_URL}/api/admin/dashboard/pending/pickups`,
            returns: `${API_BASE_URL}/api/admin/dashboard/pending/returns`,
            overdue: `${API_BASE_URL}/api/admin/dashboard/pending/overdue`,
        },
    },
    alerts: `${API_BASE_URL}/api/admin/alerts`,
    acknowledgeAlert: (id: number) => `${API_BASE_URL}/api/admin/alerts/${id}/acknowledge`,
    quickActions: {
        approve: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/approve`,
        reject: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/reject`,
        pickup: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/pickup`,
        return: (id: number) => `${API_BASE_URL}/api/admin/quick-actions/rentals/${id}/return`,
    },
    lateReturns: `${API_BASE_URL}/api/admin/late-returns`,
    lateReturnStatistics: `${API_BASE_URL}/api/admin/late-returns/statistics`,
    penaltyWaive: (id: number) => `${API_BASE_URL}/api/admin/rentals/${id}/penalty/waive`,
    penaltyHistory: (id: number) => `${API_BASE_URL}/api/admin/rentals/${id}/penalty/history`,
    users: {
        list: `${API_BASE_URL}/api/admin/users`,
        stats: `${API_BASE_URL}/api/admin/users/stats`,
        byId: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
        ban: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/ban`,
        unban: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/unban`,
        notes: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/notes`,
    },
} as const;