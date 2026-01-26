'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { LateReturnsTable, LateReturnFilters } from '@/components/admin';
import { useLateReturns } from '@/lib/hooks/use-late-returns';
import { toast } from 'sonner';
import type { LateReturnFilters as LateReturnFiltersType, LateReturnStatus } from '@/types';

function LateReturnsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const page = parseInt(searchParams.get('page') || '0', 10);
    const filters: LateReturnFiltersType = {
        status: searchParams.get('status') as LateReturnStatus || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        sortBy: searchParams.get('sortBy') as LateReturnFiltersType['sortBy'] || 'endDate',
        sortDirection: searchParams.get('sortDirection') as LateReturnFiltersType['sortDirection'] || 'DESC',
    };

    const { data, isLoading, isFetching, refetch } = useLateReturns(filters, page, 20);

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Late returns refreshed');
        } catch {
            toast.error('Failed to refresh');
        }
    };

    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`/admin/late-returns?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Late Returns' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Late Returns</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monitor and manage overdue rentals and penalties
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/late-returns/statistics">
                            <BarChart3 className="h-4 w-4" />
                            View Statistics
                        </Link>
                    </Button>
                </div>
            </div>

            <LateReturnFilters />

            <LateReturnsTable
                data={data?.content || []}
                isLoading={isLoading}
                page={page}
                totalPages={data?.totalPages || 0}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export default function LateReturnsPage() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <LateReturnsContent />
        </Suspense>
    );
}

