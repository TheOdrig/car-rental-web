'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { RevenuePeriod } from '@/types/admin';
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
            toast.success('Rental approved successfully');
        } catch (error) {
            toast.error('Failed to approve rental');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReject = async (rentalId: number, reason: string) => {
        setActionInProgress(rentalId);
        try {
            await rejectMutation.mutateAsync({ rentalId, reason });
            toast.success('Rental rejected successfully');
        } catch (error) {
            toast.error('Failed to reject rental');
        } finally {
            setActionInProgress(null);
        }
    };

    const handlePickup = async (rentalId: number, notes?: string) => {
        setActionInProgress(rentalId);
        try {
            await pickupMutation.mutateAsync({ rentalId, notes });
            toast.success('Pickup processed successfully');
        } catch (error) {
            toast.error('Failed to process pickup');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReturn = async (rentalId: number, data?: any) => {
        setActionInProgress(rentalId);
        try {
            await returnMutation.mutateAsync({ rentalId, data });
            toast.success('Return processed successfully');
        } catch (error) {
            toast.error('Failed to process return');
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


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your rental operations
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Car
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        title="Refresh Data"
                    >
                        <RefreshCw className={cn('h-4 w-4', summaryLoading && 'animate-spin')} />
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
                            maintenanceCars: 0,
                            damagedCars: 0,
                            occupancyRate: 0,
                            generatedAt: new Date().toISOString(),
                        }}
                        className={fleetLoading ? 'opacity-50' : ''}
                    />
                </div>
            </div>
        </div>
    );
}
