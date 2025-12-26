'use client';

import { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DashboardMetricsGrid,
    PendingRentalsTable,
    QuickActionsCard,
    FleetStatusCard,
} from '@/components/admin';
import {
    useDashboardSummary,
    useFleetStatus,
    usePendingApprovals,
    usePendingPickups,
    usePendingReturns,
    useApproveRental,
    useProcessPickup,
    useProcessReturn,
    useInvalidateAdmin,
} from '@/lib/hooks/use-admin';
import { toast } from 'sonner';


type ActiveTab = 'approvals' | 'pickups' | 'returns' | 'overdue';
type MetricsCardType = 'revenue' | 'activeRentals' | 'approvals' | 'users' | 'pickups' | 'returns' | 'overdue';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('approvals');
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
    const { data: fleetStatus, isLoading: fleetLoading } = useFleetStatus();
    const { data: approvals, isLoading: approvalsLoading } = usePendingApprovals();
    const { data: pickups, isLoading: pickupsLoading } = usePendingPickups();
    const { data: returns, isLoading: returnsLoading } = usePendingReturns();

    const approveMutation = useApproveRental();
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

    const handleApprove = async (rentalId: number) => {
        setActionInProgress(rentalId);
        try {
            await approveMutation.mutateAsync(rentalId);
            toast.success('Rental approved successfully');
        } catch (error) {
            toast.error('Failed to approve rental');
        } finally {
            setActionInProgress(null);
        }
    };

    const handlePickup = async (rentalId: number) => {
        setActionInProgress(rentalId);
        try {
            await pickupMutation.mutateAsync(rentalId);
            toast.success('Pickup processed successfully');
        } catch (error) {
            toast.error('Failed to process pickup');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReturn = async (rentalId: number) => {
        setActionInProgress(rentalId);
        try {
            await returnMutation.mutateAsync(rentalId);
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

    const lastUpdated = summary?.generatedAt
        ? new Date(summary.generatedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your rental operations
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Updated {lastUpdated}</span>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <DashboardMetricsGrid
                pendingApprovals={summary?.pendingApprovals ?? 0}
                todaysPickups={summary?.todaysPickups ?? 0}
                todaysReturns={summary?.todaysReturns ?? 0}
                overdueRentals={summary?.overdueRentals ?? 0}
                isLoading={summaryLoading}
                onCardClick={handleCardClick}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <PendingRentalsTable
                        items={getActiveItems()}
                        type={activeTab}
                        isLoading={isTableLoading()}
                        onApprove={handleApprove}
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
