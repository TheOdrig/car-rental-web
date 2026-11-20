import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/app/testing/test-utils';

const q = vi.hoisted(() => {
    const ok = (data: unknown = undefined) => ({
        data,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
    });
    return {
        ok,
        failing: () => ({ data: undefined, isLoading: false, isFetching: false, isError: true, refetch: vi.fn() }),
        useLateReturns: vi.fn(),
        useAlerts: vi.fn(),
        useDashboardSummary: vi.fn(),
        useFleetStatus: vi.fn(),
        useRevenueData: vi.fn(),
        usePendingApprovals: vi.fn(),
        usePendingPickups: vi.fn(),
        usePendingReturns: vi.fn(),
        useOverdueRentals: vi.fn(),
        useUserStats: vi.fn(),
    };
});

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/admin/rentals',
}));
vi.mock('@/shared/ui/breadcrumb', () => ({ Breadcrumb: () => null }));
vi.mock('@/features/admin', async () => {
    const actual = await vi.importActual<typeof import('@/features/admin')>('@/features/admin');
    return {
        ...actual,
        useLateReturns: q.useLateReturns,
        useAlerts: q.useAlerts,
        useDismissAlert: () => ({ mutateAsync: vi.fn(), isPending: false }),
        useMarkAllAlertsRead: () => ({ mutateAsync: vi.fn(), isPending: false }),
        useInvalidateAdmin: () => ({ dashboard: vi.fn(), pending: vi.fn() }),
        useDashboardSummary: q.useDashboardSummary,
        useFleetStatus: q.useFleetStatus,
        useRevenueData: q.useRevenueData,
        usePendingApprovals: q.usePendingApprovals,
        usePendingPickups: q.usePendingPickups,
        usePendingReturns: q.usePendingReturns,
        useOverdueRentals: q.useOverdueRentals,
        LateReturnFilters: () => null,
        DashboardHeader: () => null,
        DashboardMetricsGrid: () => <div data-testid="metrics-grid" />,
        QuickActionsCard: () => null,
        RevenueChart: () => <div data-testid="revenue-chart" />,
        LateReturnsTable: () => <div data-testid="late-returns-table" />,
    };
});
vi.mock('@/features/manage-users', async () => {
    const actual = await vi.importActual<typeof import('@/features/manage-users')>('@/features/manage-users');
    return {
        ...actual,
        useUserStats: q.useUserStats,
        useInvalidateUsers: () => ({ all: vi.fn() }),
        UserTable: () => <div data-testid="user-table" />,
        UserStatsCards: () => <div data-testid="user-stats" />,
    };
});
vi.mock('@/features/process-rentals', async () => {
    const actual = await vi.importActual<typeof import('@/features/process-rentals')>('@/features/process-rentals');
    return {
        ...actual,
        PendingRentalsTable: ({ type }: { type: string }) => <div data-testid={`pending-${type}`} />,
        useRentalActions: () => ({
            approve: vi.fn(),
            reject: vi.fn(),
            pickup: vi.fn(),
            processReturn: vi.fn(),
            actionInProgress: null,
        }),
        useApproveRental: () => ({ mutateAsync: vi.fn() }),
        useRejectRental: () => ({ mutateAsync: vi.fn() }),
        useProcessPickup: () => ({ mutateAsync: vi.fn() }),
        useProcessReturn: () => ({ mutateAsync: vi.fn() }),
    };
});
vi.mock('@/features/manage-fleet', async () => {
    const actual = await vi.importActual<typeof import('@/features/manage-fleet')>('@/features/manage-fleet');
    return { ...actual, FleetStatusCard: () => <div data-testid="fleet-card" /> };
});

import { LateReturnsContent } from '../late-returns/late-returns-content';
import { AdminAlertsContent } from '../alerts/admin-alerts-content';
import { UserManagementContent } from '../users/user-management-content';
import { AdminRentalsContent } from '@/widgets/admin-rentals';
import { AdminDashboardContent } from '@/widgets/admin-dashboard';

function renderPage(ui: React.ReactElement) {
    const Wrapper = createQueryWrapper();
    return render(<Wrapper>{ui}</Wrapper>);
}

const page = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 };

describe('admin pages show an error instead of empty data', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        q.useLateReturns.mockReturnValue(q.ok(page));
        q.useAlerts.mockReturnValue(q.ok([]));
        q.useDashboardSummary.mockReturnValue(q.ok({ pendingApprovals: 1 }));
        q.useFleetStatus.mockReturnValue(q.ok({ rentedCars: 2 }));
        q.useRevenueData.mockReturnValue(q.ok({ breakdownByCurrency: [], monthlyRevenue: [] }));
        q.usePendingApprovals.mockReturnValue(q.ok(page));
        q.usePendingPickups.mockReturnValue(q.ok(page));
        q.usePendingReturns.mockReturnValue(q.ok(page));
        q.useOverdueRentals.mockReturnValue(q.ok(page));
        q.useUserStats.mockReturnValue(q.ok({ totalUsers: 3, activeUsers: 2, bannedUsers: 1 }));
    });

    it('late returns', async () => {
        const failing = q.failing();
        q.useLateReturns.mockReturnValue(failing);
        renderPage(<LateReturnsContent />);

        expect(screen.queryByTestId('late-returns-table')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(failing.refetch).toHaveBeenCalledTimes(1);
    });

    it('late returns still render the table when loading works', () => {
        renderPage(<LateReturnsContent />);

        expect(screen.getByTestId('late-returns-table')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('alerts do not claim the system is running smoothly', async () => {
        const failing = q.failing();
        q.useAlerts.mockReturnValue(failing);
        renderPage(<AdminAlertsContent />);

        expect(screen.queryByText(/running smoothly/i)).not.toBeInTheDocument();
        expect(screen.queryByText('No alerts found')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(failing.refetch).toHaveBeenCalledTimes(1);
    });

    it('user management hides statistics that failed to load', async () => {
        const failing = q.failing();
        q.useUserStats.mockReturnValue(failing);
        renderPage(<UserManagementContent />);

        expect(screen.queryByTestId('user-stats')).not.toBeInTheDocument();
        expect(screen.getByTestId('user-table')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(failing.refetch).toHaveBeenCalledTimes(1);
    });

    it('rental management marks failed lists and counts', async () => {
        const failing = q.failing();
        q.usePendingPickups.mockReturnValue(failing);
        q.usePendingApprovals.mockReturnValue(q.ok({ content: [{ id: 1 }], totalElements: 1 }));
        renderPage(<AdminRentalsContent />);

        expect(screen.queryByTestId('pending-pickups')).not.toBeInTheDocument();
        expect(screen.getByTestId('pending-approvals')).toBeInTheDocument();
        expect(screen.getByText('No pending returns or overdue rentals.')).toBeInTheDocument();
        expect(screen.getByText('Some counts could not be loaded')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(failing.refetch).toHaveBeenCalledTimes(1);
    });

    it('dashboard hides metrics that failed instead of showing zeros', async () => {
        const failing = q.failing();
        q.useRevenueData.mockReturnValue(failing);
        renderPage(<AdminDashboardContent />);

        expect(screen.getByText('Failed to load dashboard metrics')).toBeInTheDocument();
        expect(screen.getByText('Failed to load revenue')).toBeInTheDocument();
        await userEvent.click(screen.getAllByRole('button', { name: /try again/i })[0]);
        expect(failing.refetch).toHaveBeenCalled();
    });

    it('dashboard reports a failed pending list instead of an empty table', () => {
        q.usePendingApprovals.mockReturnValue(q.failing());
        renderPage(<AdminDashboardContent />);

        expect(screen.getByText('Failed to load this list')).toBeInTheDocument();
        expect(screen.queryByTestId('pending-approvals')).not.toBeInTheDocument();
    });
});
