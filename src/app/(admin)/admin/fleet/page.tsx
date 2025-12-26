'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus, Download, Clock, Search, Filter } from 'lucide-react';
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
import { useFleetStatus, useInvalidateAdmin } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';

type CarStatus = 'all' | 'available' | 'rented' | 'maintenance' | 'damaged';

export default function FleetManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CarStatus>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');

    const { data: fleetStatus, isLoading } = useFleetStatus();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.fleet();
        toast.success('Fleet data refreshed');
    };

    const handleExport = () => {
        toast.info('Export feature coming soon');
    };

    const lastUpdated = fleetStatus?.generatedAt
        ? new Date(fleetStatus.generatedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : null;

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet Management' },
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <p className="text-sm">Manage your vehicle inventory</p>
                        {lastUpdated && (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full border border-dashed">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                Updated {lastUpdated}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                        aria-label="Refresh fleet data"
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                        aria-label="Export fleet data"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button size="sm" className="gap-2" asChild>
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
                    maintenanceCars: 0,
                    damagedCars: 0,
                    occupancyRate: 0,
                    generatedAt: new Date().toISOString(),
                }}
                isLoading={isLoading}
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
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CarStatus)}>
                        <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="rented">On Road</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                        <SelectTrigger className="w-[140px]" aria-label="Filter by brand">
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

            {/* Fleet Table */}
            <FleetTable
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                brandFilter={brandFilter}
                isLoading={isLoading}
            />
        </div>
    );
}
