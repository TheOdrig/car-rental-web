'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { DamageTable, DamageFilters } from '@/features/admin';
import { Pagination } from '@/shared/ui/pagination';
import { useDamages, useCustomerDamages } from '@/features/manage-damages';
import { ErrorMessage } from '@/shared/ui/error-message';
import { PageHeader } from '@/shared/ui/page-header';
import { toast } from 'sonner';
import { DAMAGE_CATEGORIES, DAMAGE_SEVERITIES, DAMAGE_STATUSES, type DamageSearchFilters } from '@/entities/damage';
import { pickCode } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { withQuery } from '@/shared/lib/url';

function parsePositiveInt(value: string | null | undefined): number | undefined {
    if (!value || !/^[0-9]+$/.test(value)) return undefined;
    const parsed = Number(value);
    return parsed > 0 ? parsed : undefined;
}

function DamagesList() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const page = parseInt(searchParams?.get('page') || '0', 10);
    const filters: DamageSearchFilters = {
        severity: pickCode(searchParams?.get('severity'), DAMAGE_SEVERITIES),
        category: pickCode(searchParams?.get('category'), DAMAGE_CATEGORIES),
        status: pickCode(searchParams?.get('status'), DAMAGE_STATUSES),
        startDate: searchParams?.get('startDate') || undefined,
        endDate: searchParams?.get('endDate') || undefined,
        carId: parsePositiveInt(searchParams?.get('carId')),
    };
    const userId = parsePositiveInt(searchParams?.get('userId'));

    const searchQuery = useDamages(filters, page, 20, userId === undefined);
    const customerQuery = useCustomerDamages(userId, page, 20);
    const { data, isLoading, isFetching, isError, refetch } = userId !== undefined ? customerQuery : searchQuery;

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Damages refreshed');
        } catch {
            toast.error('Failed to refresh');
        }
    };

    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set('page', String(newPage));
        router.push(withQuery(ROUTES.admin.damages, params.toString()));
    }, [router, searchParams]);

    return (
        <div className="space-y-6">
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Damage Reports' },
                        ]}
                    />
                }
                title="Damage Reports"
                description="Manage and track vehicle damage reports"
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            aria-label="Refresh damage reports"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.damageStatistics}>
                                <BarChart3 className="h-4 w-4" />
                                View Statistics
                            </Link>
                        </Button>
                    </>
                }
            />

            {(userId !== undefined || filters.carId !== undefined) && (
                <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 text-sm">
                    <span>
                        {userId !== undefined
                            ? `Showing damages for customer #${userId}. Other filters do not apply to this view.`
                            : `Showing damages for vehicle #${filters.carId}.`}
                    </span>
                    <Button variant="link" size="sm" asChild>
                        <Link href={ROUTES.admin.damages}>Show all damages</Link>
                    </Button>
                </div>
            )}

            {userId === undefined && <DamageFilters />}

            {isError ? (
                <ErrorMessage
                    title="Failed to load damage reports"
                    message="The damage reports could not be loaded. Check your connection and try again."
                    onRetry={() => void refetch()}
                />
            ) : (
                <DamageTable
                    damages={data?.content || []}
                    isLoading={isLoading}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}

export function DamagesContent() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <DamagesList />
        </Suspense>
    );
}
