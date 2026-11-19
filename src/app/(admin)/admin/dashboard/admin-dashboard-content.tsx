'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { clientPost } from '@/shared/api';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { ErrorMessage } from '@/shared/ui/error-message';
import { Breadcrumb } from '@/widgets/layout';
import { DashboardHeader, DashboardMetricsGrid, QuickActionsCard, RevenueChart, processRevenueData, useDashboardSummary, useFleetStatus, useInvalidateAdmin, usePendingApprovals, usePendingPickups, usePendingReturns, useRevenueData } from '@/features/admin';
import { FleetStatusCard } from '@/features/manage-fleet';
import { PendingRentalsTable } from '@/features/process-rentals';
import type { RevenuePeriod } from '@/features/admin';
import { useRentalActions } from '@/features/process-rentals';

type ActiveTab = 'approvals' | 'pickups' | 'returns' | 'overdue';

const EMPTY_FLEET_STATUS = {
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
    reservedCars: 0,
    maintenanceCars: 0,
    inspectionCars: 0,
    damagedCars: 0,
    occupancyRate: 0,
};

function formatUpdatedTime(generatedAt: string | undefined): string | null {
    if (!generatedAt) return null;

    return new Date(generatedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function AdminDashboardContent() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('approvals');
    const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('last6months');
    const [refreshingRates, setRefreshingRates] = useState(false);

    const summaryQuery = useDashboardSummary();
    const fleetQuery = useFleetStatus();
    const revenueQuery = useRevenueData();
    const approvalsQuery = usePendingApprovals();
    const pickupsQuery = usePendingPickups();
    const returnsQuery = usePendingReturns();
    const { data: summary, isLoading: summaryLoading } = summaryQuery;
    const { data: fleetStatus, isLoading: fleetLoading } = fleetQuery;
    const { data: revenueAnalytics, isLoading: revenueLoading } = revenueQuery;
    const { data: approvals, isLoading: approvalsLoading } = approvalsQuery;
    const { data: pickups, isLoading: pickupsLoading } = pickupsQuery;
    const { data: returns, isLoading: returnsLoading } = returnsQuery;
    const metricsFailed = summaryQuery.isError || revenueQuery.isError || fleetQuery.isError;
    const retryMetrics = () => {
        void summaryQuery.refetch();
        void revenueQuery.refetch();
        void fleetQuery.refetch();
    };

    const actions = useRentalActions();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.dashboard();
        toast.success('Dashboard refreshed');
    };

    const handleRefreshRates = async () => {
        setRefreshingRates(true);
        try {
            await clientPost('/api/exchange-rates/refresh');
            toast.success('Exchange rates refreshed');
            window.location.reload();
        } catch {
            toast.error('Failed to refresh exchange rates');
        } finally {
            setRefreshingRates(false);
        }
    };

    const handleCardClick = (type: string) => {
        if (type === 'approvals' || type === 'pickups' || type === 'returns' || type === 'overdue') {
            setActiveTab(type);
        }
    };

    const tabSources = {
        approvals: { items: approvals?.content ?? [], loading: approvalsLoading, failed: approvalsQuery.isError, retry: () => void approvalsQuery.refetch() },
        pickups: { items: pickups?.content ?? [], loading: pickupsLoading, failed: pickupsQuery.isError, retry: () => void pickupsQuery.refetch() },
        returns: { items: returns?.content ?? [], loading: returnsLoading, failed: returnsQuery.isError, retry: () => void returnsQuery.refetch() },
        overdue: { items: returns?.content ?? [], loading: returnsLoading, failed: returnsQuery.isError, retry: () => void returnsQuery.refetch() },
    };

    const chartData = useMemo(() => {
        if (!revenueAnalytics?.monthlyRevenue) return [];
        return processRevenueData(revenueAnalytics.monthlyRevenue, revenuePeriod);
    }, [revenueAnalytics, revenuePeriod]);

    const latestRevenue = useMemo(() => {
        const monthly = revenueAnalytics?.monthlyRevenue;
        return monthly && monthly.length > 0 ? monthly[monthly.length - 1] : null;
    }, [revenueAnalytics]);

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                <Breadcrumb items={[{ label: 'Dashboard' }]} />

                <DashboardHeader
                    lastUpdated={formatUpdatedTime(summary?.generatedAt)}
                    isRefreshing={summaryLoading}
                    isRefreshingRates={refreshingRates}
                    onRefresh={handleRefresh}
                    onRefreshRates={handleRefreshRates}
                />

                {metricsFailed ? (
                    <ErrorMessage
                        title="Failed to load dashboard metrics"
                        message="Some dashboard figures could not be loaded, so they are hidden instead of shown as zero."
                        onRetry={retryMetrics}
                    />
                ) : (
                    <DashboardMetricsGrid
                        totalRevenue={revenueAnalytics?.breakdown.totalRevenue}
                        revenueTrend={
                            latestRevenue
                                ? {
                                      value: Math.abs(latestRevenue.growthPercentage),
                                      direction: latestRevenue.growthPercentage >= 0 ? 'up' : 'down',
                                      label: 'vs last month',
                                  }
                                : undefined
                        }
                        activeRentals={fleetStatus?.rentedCars}
                        pendingApprovals={summary?.pendingApprovals ?? 0}
                        isLoading={summaryLoading || revenueLoading}
                        onCardClick={handleCardClick}
                    />
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {revenueQuery.isError ? (
                            <ErrorMessage
                                title="Failed to load revenue"
                                message="The revenue chart could not be loaded."
                                onRetry={() => void revenueQuery.refetch()}
                            />
                        ) : (
                            <RevenueChart
                                data={chartData}
                                period={revenuePeriod}
                                onPeriodChange={setRevenuePeriod}
                                isLoading={revenueLoading}
                                breakdown={revenueAnalytics?.breakdown}
                            />
                        )}

                        {tabSources[activeTab].failed ? (
                            <ErrorMessage
                                title="Failed to load this list"
                                message="The list could not be loaded."
                                onRetry={tabSources[activeTab].retry}
                            />
                        ) : (
                            <PendingRentalsTable
                                items={tabSources[activeTab].items}
                                type={activeTab}
                                isLoading={tabSources[activeTab].loading}
                                onApprove={actions.approve}
                                onReject={actions.reject}
                                onPickup={actions.pickup}
                                onReturn={actions.processReturn}
                                actionInProgress={actions.actionInProgress}
                            />
                        )}
                    </div>
                    <div className="space-y-6">
                        <QuickActionsCard
                            pickupItems={pickups?.content ?? []}
                            returnItems={returns?.content ?? []}
                            isLoading={pickupsLoading || returnsLoading}
                            onPickup={actions.pickup}
                            onReturn={actions.processReturn}
                            actionInProgress={actions.actionInProgress}
                        />
                        {!fleetQuery.isError && (
                            <FleetStatusCard
                                data={
                                    fleetStatus ?? { ...EMPTY_FLEET_STATUS, generatedAt: new Date().toISOString() }
                                }
                                className={fleetLoading ? 'opacity-50' : ''}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
