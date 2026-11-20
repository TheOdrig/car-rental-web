'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus, Clock, Search, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Breadcrumb } from '@/widgets/layout';
import { FleetStatsCards, FleetTable } from '@/features/manage-fleet';
import { useFleetStatus } from '@/features/admin';
import {
    useFleetList,
    useDeleteCar,
    useChangeCarStatus,
} from '@/features/manage-fleet';
import { toast } from 'sonner';
import { CAR_OCCUPANCIES, CAR_OCCUPANCY_LABELS, CAR_STATUSES, CAR_SERVICE_STATUS_LABELS, useFilterOptions, type CarOccupancy, type CarStatus } from '@/entities/car';
import { formatTime } from '@/shared/lib';

type StatusFilter = 'all' | CarStatus;
type OccupancyFilter = 'all' | CarOccupancy;

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

export function FleetManagementContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');
    const [occupancyFilter, setOccupancyFilter] = useState<OccupancyFilter>('all');

    const { data: filterOptions } = useFilterOptions();
    const { data: fleetStatus, isLoading: isLoadingStats, refetch: refetchFleet, isFetching: isFetchingFleet } = useFleetStatus();
    const { data: carsData, isLoading: isLoadingCars, refetch: refetchCars, isFetching: isFetchingCars } = useFleetList({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        brand: brandFilter !== 'all' ? brandFilter : undefined,
        occupancy: occupancyFilter !== 'all' ? occupancyFilter : undefined,
        search: debouncedSearch || undefined,
        page,
        size: PAGE_SIZE,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setPage(0);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const isRefreshing = isFetchingFleet || isFetchingCars;
    const brandOptions = brandFilter !== 'all' && !filterOptions?.brands.includes(brandFilter)
        ? [brandFilter, ...(filterOptions?.brands ?? [])]
        : (filterOptions?.brands ?? []);

    const deleteCarMutation = useDeleteCar();
    const updateStatusMutation = useChangeCarStatus();


    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchFleet(),
                refetchCars(),
            ]);
            toast.success('Fleet data refreshed');
        } catch (error) {
            console.error('[Fleet] Refresh failed:', error);
            toast.error('Failed to refresh');
        }
    };

    const handleDeleteCar = (carId: number) => {
        deleteCarMutation.mutate(carId);
    };

    const handleUpdateStatus = (carId: number, status: CarStatus) => {
        updateStatusMutation.mutate({ id: carId, status });
    };

    const lastUpdated = fleetStatus?.generatedAt
        ? formatTime(fleetStatus.generatedAt)
        : null;

    const isLoading = isLoadingStats || isLoadingCars;

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet Management' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fleet Management</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>Manage your vehicle inventory</span>
                        {lastUpdated && (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium bg-card px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                Updated {lastUpdated}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh fleet data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    </Button>

                    <Button size="sm" className="gap-2 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer" asChild>
                        <Link href="/admin/fleet/new">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add New Car
                        </Link>
                    </Button>
                </div>
            </div>

            <FleetStatsCards
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
                isLoading={isLoadingStats}
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Search by brand, model or license plate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        aria-label="Search cars"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => {
                        setStatusFilter(v as StatusFilter);
                        setPage(0);
                    }}>
                        <SelectTrigger
                            className="w-[160px] bg-background border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
                            aria-label="Filter by status"
                        >
                            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                            <SelectValue placeholder="Service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any service</SelectItem>
                            {CAR_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {CAR_SERVICE_STATUS_LABELS[status]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={occupancyFilter}
                        onValueChange={(v) => {
                            setOccupancyFilter(v as OccupancyFilter);
                            setPage(0);
                        }}
                    >
                        <SelectTrigger
                            className="w-[160px] bg-background border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
                            aria-label="Filter by occupancy"
                        >
                            <SelectValue placeholder="Occupancy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any occupancy</SelectItem>
                            {CAR_OCCUPANCIES.map((occupancy) => (
                                <SelectItem key={occupancy} value={occupancy}>
                                    {CAR_OCCUPANCY_LABELS[occupancy]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={brandFilter}
                        onValueChange={(v) => {
                            setBrandFilter(v);
                            setPage(0);
                        }}
                    >
                        <SelectTrigger
                            className="w-[160px] bg-background border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
                            aria-label="Filter by brand"
                        >
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {brandOptions.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                    {brand}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <FleetTable
                cars={carsData?.content ?? []}
                totalCars={carsData?.totalElements ?? 0}
                page={page}
                totalPages={carsData?.totalPages ?? 1}
                onPageChange={setPage}
                isLoading={isLoading}
                onDeleteCar={handleDeleteCar}
                onUpdateStatus={handleUpdateStatus}
                isDeleting={deleteCarMutation.isPending}
                isUpdatingStatus={updateStatusMutation.isPending}
            />
        </div>
    );
}
