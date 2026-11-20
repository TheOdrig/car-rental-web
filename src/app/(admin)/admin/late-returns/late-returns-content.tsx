'use client';

import { Suspense, useCallback } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { LateReturnsTable, LateReturnFilters } from '@/features/admin';
import { useLateReturns } from '@/features/admin';
import { toast } from 'sonner';
import { ErrorMessage } from '@/shared/ui/error-message';
import { PageHeader } from '@/shared/ui/page-header';
import {
    LATE_RETURN_SORT_DIRECTIONS,
    LATE_RETURN_SORT_FIELDS,
    LATE_RETURN_STATUSES,
    type LateReturnFilters as LateReturnFiltersType,
} from '@/entities/rental';
import { pickCode } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useUrlState } from '@/shared/lib/use-url-state';

function LateReturnsList() {
    const { searchParams, update } = useUrlState();

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
        update({ page: newPage }, { path: ROUTES.admin.lateReturns });
    }, [update]);

    return (
        <div className="space-y-6">
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Late Returns' },
                        ]}
                    />
                }
                title="Late Returns"
                description="Monitor and manage overdue rentals and penalties"
                actions={
                    <>
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
                            <Link href={ROUTES.admin.lateReturnStatistics}>
                                <BarChart3 className="h-4 w-4" />
                                View Statistics
                            </Link>
                        </Button>
                    </>
                }
            />

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
