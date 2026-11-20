'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/widgets/layout';
import { LateReturnsTable, LateReturnFilters } from '@/features/admin';
import { useLateReturns } from '@/features/admin';
import { toast } from 'sonner';
import { ErrorMessage } from '@/shared/ui/error-message';
import {
    LATE_RETURN_SORT_DIRECTIONS,
    LATE_RETURN_SORT_FIELDS,
    LATE_RETURN_STATUSES,
    type LateReturnFilters as LateReturnFiltersType,
} from '@/entities/rental';
import { pickCode } from '@/shared/lib';

function LateReturnsList() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const page = parseInt(searchParams?.get('page') || '0', 10);
    const filters: LateReturnFiltersType = {
        status: pickCode(searchParams?.get('status'), LATE_RETURN_STATUSES),
        startDate: searchParams?.get('startDate') || undefined,
        endDate: searchParams?.get('endDate') || undefined,
        sortBy: pickCode(searchParams?.get('sortBy'), LATE_RETURN_SORT_FIELDS) ?? 'endDate',
        sortDirection: pickCode(searchParams?.get('sortDirection'), LATE_RETURN_SORT_DIRECTIONS) ?? 'DESC',
    };

    const { data, isLoading, isFetching, isError, refetch } = useLateReturns(filters, page, 20);

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Late returns refreshed');
        } catch {
            toast.error('Failed to refresh');
        }
    };

    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams?.toString());
        params?.set('page', String(newPage));
        router.push(`/admin/late-returns?${params?.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Late Returns' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-lg border border-border shadow-sm">
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
                        aria-label="Refresh late returns"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
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

            {isError ? (
                <ErrorMessage
                    title="Failed to load late returns"
                    message="The late returns could not be loaded. Check your connection and try again."
                    onRetry={() => void refetch()}
                />
            ) : (
                <LateReturnsTable
                    data={data?.content || []}
                    isLoading={isLoading}
                    page={page}
                    totalPages={data?.totalPages || 0}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}

export function LateReturnsContent() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <LateReturnsList />
        </Suspense>
    );
}
