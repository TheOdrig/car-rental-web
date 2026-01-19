'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DamageTable, DamageFilters } from '@/components/admin';
import { Pagination } from '@/components/ui/pagination';
import { useDamages } from '@/lib/hooks';
import { toast } from 'sonner';
import type { DamageSearchFilters } from '@/types';

function DamagesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const page = parseInt(searchParams.get('page') || '0', 10);
    const filters: DamageSearchFilters = {
        severity: searchParams.get('severity') as DamageSearchFilters['severity'] || undefined,
        category: searchParams.get('category') as DamageSearchFilters['category'] || undefined,
        status: searchParams.get('status') as DamageSearchFilters['status'] || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
    };

    const { data, isLoading, isFetching, refetch } = useDamages(filters, page, 20);

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Damages refreshed');
        } catch {
            toast.error('Failed to refresh');
        }
    };

    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`/admin/damages?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Damage Reports' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Damage Reports</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage and track vehicle damage reports
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="h-9 w-9 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-xl cursor-pointer"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 rounded-xl" asChild>
                        <Link href="/admin/damages/statistics">
                            <BarChart3 className="h-4 w-4" />
                            View Statistics
                        </Link>
                    </Button>
                </div>
            </div>

            <DamageFilters />

            <DamageTable
                damages={data?.content || []}
                isLoading={isLoading}
            />

            {data && data.totalPages > 1 && (
                <Pagination
                    currentPage={data.number}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}

export default function DamagesPage() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <DamagesContent />
        </Suspense>
    );
}
