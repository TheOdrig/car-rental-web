'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/shared';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
    DashboardMetricsGrid,
    PendingRentalsTable,
    QuickActionsCard,
    FleetStatusCard,
    RevenueChart,
} from '@/components/admin';
import {
    useDashboardSummary,
    useFleetStatus,
    usePendingApprovals,
    usePendingPickups,
    usePendingReturns,
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
    useInvalidateAdmin,
    useRevenueData,
} from '@/lib/hooks/use-admin';
import { processRevenueData } from '@/lib/utils/admin-utils';
import type { RevenuePeriod, ProcessReturnData } from '@/types/admin';
import { toast } from 'sonner';


type ActiveTab = 'approvals' | 'pickups' | 'returns' | 'overdue';
type MetricsCardType = 'revenue' | 'activeRentals' | 'approvals' | 'users' | 'pickups' | 'returns' | 'overdue';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('approvals');
    const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('last6months');
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
    const { data: fleetStatus, isLoading: fleetLoading } = useFleetStatus();
    const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueData();
    const { data: approvals, isLoading: approvalsLoading } = usePendingApprovals();
    const { data: pickups, isLoading: pickupsLoading } = usePendingPickups();
    const { data: returns, isLoading: returnsLoading } = usePendingReturns();

    const approveMutation = useApproveRental();
    const rejectMutation = useRejectRental();
    const pickupMutation = useProcessPickup();
    const returnMutation = useProcessReturn();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.dashboard();
        toast.success('Dashboard refreshed');
    };

    const handleCardClick = (type: MetricsCardType) => {
        switch (type) {
            case 'revenue':
            case 'activeRentals':
            case 'users':
                break;
            case 'approvals':
            case 'pickups':
            case 'returns':
            case 'overdue':
                setActiveTab(type);
                break;
        }
    };

    const handleApprove = async (rentalId: number, notes?: string) => {
        setActionInProgress(rentalId);
        try {
            await approveMutation.mutateAsync({ rentalId, notes });
        } catch (error) {
            console.error('Failed to approve rental:', error);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReject = async (rentalId: number, reason: string) => {
        setActionInProgress(rentalId);
        try {
            await rejectMutation.mutateAsync({ rentalId, reason });
        } catch (error) {
            console.error('Failed to reject rental:', error);
        } finally {
            setActionInProgress(null);
        }
    };

    const handlePickup = async (rentalId: number, notes?: string) => {
        setActionInProgress(rentalId);
        try {
            await pickupMutation.mutateAsync({ rentalId, notes });
        } catch (error) {
            console.error('Failed to process pickup:', error);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReturn = async (rentalId: number, data?: string | ProcessReturnData) => {
        setActionInProgress(rentalId);
        try {
            await returnMutation.mutateAsync({ rentalId, data });
        } catch (error) {
            console.error('Failed to process return:', error);
        } finally {
            setActionInProgress(null);
        }
    };

    const getActiveItems = () => {
        switch (activeTab) {
            case 'approvals':
                return approvals?.content ?? [];
            case 'pickups':
                return pickups?.content ?? [];
            case 'returns':
            case 'overdue':
                return returns?.content ?? [];
            default:
                return [];
        }
    };

    const isTableLoading = () => {
        switch (activeTab) {
            case 'approvals':
                return approvalsLoading;
            case 'pickups':
                return pickupsLoading;
            case 'returns':
            case 'overdue':
                return returnsLoading;
            default:
                return false;
        }
    };

    const chartData = useMemo(() => {
        if (!revenueAnalytics?.monthlyRevenue) return [];
        return processRevenueData(revenueAnalytics.monthlyRevenue, revenuePeriod);
    }, [revenueAnalytics, revenuePeriod]);

    const latestRevenue = useMemo(() => {
        if (!revenueAnalytics?.monthlyRevenue || revenueAnalytics.monthlyRevenue.length === 0) return null;
        return revenueAnalytics.monthlyRevenue[revenueAnalytics.monthlyRevenue.length - 1];
    }, [revenueAnalytics]);

    const lastUpdated = summary?.generatedAt
        ? new Date(summary.generatedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : null;

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard' },
                    ]}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <p className="text-sm">Overview of your rental operations</p>
                            {lastUpdated && (
                                <span className="flex items-center gap-1.5 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full border border-dashed">
                                    <Clock className="h-3 w-3" />
                                    Updated {lastUpdated}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                            size="sm"
                            className="gap-2 shrink-0 cursor-pointer"
                            aria-label="Add new car to fleet"
                            asChild
                        >
                            <a href="/admin/fleet/new">
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Add New Car
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className="shrink-0 cursor-pointer"
                            aria-label={summaryLoading ? "Refreshing data" : "Refresh dashboard data"}
                        >
                            <RefreshCw className={cn('h-4 w-4', summaryLoading && 'animate-spin')} aria-hidden="true" />
                        </Button>
                    </div>
                </div>

                <DashboardMetricsGrid
                    totalRevenue={revenueAnalytics?.breakdown.totalRevenue}
                    revenueTrend={latestRevenue ? {
                        value: Math.abs(latestRevenue.growthPercentage),
                        direction: latestRevenue.growthPercentage >= 0 ? 'up' : 'down',
                        label: 'vs last month'
                    } : undefined}
                    activeRentals={fleetStatus?.rentedCars}
                    pendingApprovals={summary?.pendingApprovals ?? 0}
                    isLoading={summaryLoading || revenueLoading}
                    onCardClick={handleCardClick}
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <RevenueChart
                            data={chartData}
                            period={revenuePeriod}
                            onPeriodChange={setRevenuePeriod}
                            isLoading={revenueLoading}
                            breakdown={revenueAnalytics?.breakdown}
                        />

                        <PendingRentalsTable
                            items={getActiveItems()}
                            type={activeTab}
                            isLoading={isTableLoading()}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onPickup={handlePickup}
                            onReturn={handleReturn}
                            actionInProgress={actionInProgress}
                        />
                    </div>
                    <div className="space-y-6">
                        <QuickActionsCard
                            pickupItems={pickups?.content ?? []}
                            returnItems={returns?.content ?? []}
                            isLoading={pickupsLoading || returnsLoading}
                            onPickup={handlePickup}
                            onReturn={handleReturn}
                            actionInProgress={actionInProgress}
                        />
                        <FleetStatusCard
                            data={fleetStatus ?? {
                                totalCars: 0,
                                availableCars: 0,
                                rentedCars: 0,
                                reservedCars: 0,
                                maintenanceCars: 0,
                                inspectionCars: 0,
                                damagedCars: 0,
                                occupancyRate: 0,
                                generatedAt: new Date().toISOString(),
                            }}
                            className={fleetLoading ? 'opacity-50' : ''}
                        />
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
