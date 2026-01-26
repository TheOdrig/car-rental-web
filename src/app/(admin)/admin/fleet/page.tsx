'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus, Clock, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FleetStatsCards } from '@/components/admin/fleet-stats';
import { FleetTable } from '@/components/admin/fleet-table';
import {
    useFleetStatus,
    useInvalidateAdmin,
    useAdminCars,
    useDeleteCar,
    useUpdateCarStatus,
} from '@/lib/hooks/use-admin';
import { toast } from 'sonner';
import type { CarStatus } from '@/types';

type StatusFilter = 'all' | CarStatus;

export default function FleetManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');


    const { data: fleetStatus, isLoading: isLoadingStats, refetch: refetchFleet, isFetching: isFetchingFleet } = useFleetStatus();
    const { data: carsData, isLoading: isLoadingCars, refetch: refetchCars, isFetching: isFetchingCars } = useAdminCars({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        brand: brandFilter !== 'all' ? brandFilter : undefined,
        search: searchQuery || undefined,
        size: 25,
    });
    useInvalidateAdmin();

    const isRefreshing = isFetchingFleet || isFetchingCars;


    const deleteCarMutation = useDeleteCar();
    const updateStatusMutation = useUpdateCarStatus();


    const carsContent = carsData?.content;
    const filteredCars = useMemo(() => {
        if (!carsContent) return [];

        return carsContent.filter((car) => {
            const matchesSearch =
                searchQuery === '' ||
                `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' || car.carStatusType === statusFilter;

            const matchesBrand =
                brandFilter === 'all' || car.brand.toLowerCase() === brandFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesBrand;
        });
    }, [carsContent, searchQuery, statusFilter, brandFilter]);

    const handleRefresh = async () => {
        console.log('[Fleet] Refreshing data...');
        try {
            await Promise.all([
                refetchFleet(),
                refetchCars(),
            ]);
            console.log('[Fleet] Refresh complete');
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
        updateStatusMutation.mutate({ carId, status });
    };

    const lastUpdated = fleetStatus?.generatedAt
        ? new Date(fleetStatus.generatedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fleet Management</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>Manage your vehicle inventory</span>
                        {lastUpdated && (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50">
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
                        placeholder="Search by car name or license plate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        aria-label="Search cars"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                        <SelectTrigger
                            className="w-[140px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
                            aria-label="Filter by status"
                        >
                            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Sold">On Road</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                        <SelectTrigger
                            className="w-[140px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
                            aria-label="Filter by brand"
                        >
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            <SelectItem value="toyota">Toyota</SelectItem>
                            <SelectItem value="bmw">BMW</SelectItem>
                            <SelectItem value="mercedes">Mercedes</SelectItem>
                            <SelectItem value="tesla">Tesla</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            { }
            <FleetTable
                cars={filteredCars}
                totalCars={carsData?.totalElements ?? 0}
                isLoading={isLoading}
                onDeleteCar={handleDeleteCar}
                onUpdateStatus={handleUpdateStatus}
                isDeleting={deleteCarMutation.isPending}
                isUpdatingStatus={updateStatusMutation.isPending}
            />
        </div>
    );
}

