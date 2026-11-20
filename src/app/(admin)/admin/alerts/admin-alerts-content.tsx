'use client';

import { useState, useMemo } from 'react';
import {
    RefreshCw, Search, CheckCheck, AlertTriangle, Filter
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/shared/ui/select';
import { AlertsPanel } from '@/features/admin';
import { useAlerts, useDismissAlert, useMarkAllAlertsRead, useInvalidateAdmin } from '@/features/admin';
import { AlertVariant } from '@/features/admin';
import { toast } from 'sonner';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { EmptyState } from '@/shared/ui/empty-state';

export function AdminAlertsContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<AlertVariant | 'all'>('all');

    const { data: alerts = [], isLoading, isFetching, isError, refetch } = useAlerts();
    const dismissMutation = useDismissAlert();
    const markAllReadMutation = useMarkAllAlertsRead();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.dashboard();
        toast.success('Alerts refreshed');
    };

    const handleDismiss = async (alertId: string) => {
        if (dismissMutation.isPending) return;
        try {
            await dismissMutation.mutateAsync(alertId);
        } catch {
            toast.error('Failed to dismiss alert');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllReadMutation.mutateAsync();
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const filteredAlerts = useMemo(() => {
        return alerts.filter((alert) => {
            const matchesSearch =
                alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                alert.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'all' || alert.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [alerts, searchQuery, typeFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                    <p className="text-muted-foreground">
                        Critical notifications and system status updates
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                        disabled={alerts.length === 0 || markAllReadMutation.isPending}
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                        disabled={isFetching}
                    >
                        <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search alerts..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => setTypeFilter(value as AlertVariant | 'all')}
                    >
                        <SelectTrigger aria-label="Filter by category" className="w-full md:w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="critical">Critical Only</SelectItem>
                            <SelectItem value="warning">Warnings</SelectItem>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="min-h-[400px]">
                {isError ? (
                    <ErrorMessage
                        title="Failed to load alerts"
                        message="The alerts could not be loaded. Check your connection and try again."
                        onRetry={() => void refetch()}
                    />
                ) : isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <EmptyState
                        icon={AlertTriangle}
                        title="No alerts found"
                        description={
                            searchQuery || typeFilter !== 'all'
                                ? "We couldn't find any alerts matching your current filters."
                                : 'No alerts have been raised.'
                        }
                        className="rounded-lg border-2 border-dashed border-muted bg-muted/30 py-20"
                    >
                        {(searchQuery || typeFilter !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearchQuery('');
                                    setTypeFilter('all');
                                }}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </EmptyState>
                ) : (
                    <AlertsPanel
                        alerts={filteredAlerts}
                        onDismiss={handleDismiss}
                        className="p-0"
                    />
                )}
            </div>
        </div>
    );
}
