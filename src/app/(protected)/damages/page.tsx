'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useMyDamages } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ErrorBoundary } from '@/components/shared';
import { DamageList } from '@/components/damages';

export default function MyDamagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = parseInt(searchParams.get('page') || '0', 10);

    const { data, isLoading, error } = useMyDamages(page, 10);

    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`/damages?${params.toString()}`);
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="container py-8">
                <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
                    <h3 className="mb-2 text-lg font-semibold">Failed to load damages</h3>
                    <p>Please try again later or contact support if the problem persists.</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="container py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                        <h1 className="text-3xl font-bold">Damage Reports</h1>
                    </div>
                    <p className="text-muted-foreground">
                        View damage reports associated with your rentals
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : (
                    <>
                        <DamageList
                            damages={data?.content || []}
                            isLoading={isLoading}
                        />

                        {data && data.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={data.number}
                                    totalPages={data.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </ErrorBoundary>
    );
}
