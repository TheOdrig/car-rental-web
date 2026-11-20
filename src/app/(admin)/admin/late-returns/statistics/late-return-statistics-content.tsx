'use client';

import { Suspense, useState } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PageHeader } from '@/shared/ui/page-header';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { LateReturnStats } from '@/features/admin';
import { useLateReturnStatistics } from '@/features/admin';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/config/routes';

function StatisticsContent() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data, isLoading, isFetching, refetch } = useLateReturnStatistics(startDate, endDate);

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Statistics refreshed');
        } catch {
            toast.error('Failed to refresh');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Late Returns', href: ROUTES.admin.lateReturns },
                            { label: 'Statistics' },
                        ]}
                    />
                }
                title="Late Return Statistics"
                description="Analyze late return trends and penalty metrics"
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            aria-label="Refresh late return statistics"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.lateReturns}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-card/50 border border-border">
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-muted-foreground">
                        Start Date
                    </Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-[160px] bg-background dark:bg-input/30 border-border"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-muted-foreground">
                        End Date
                    </Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-[160px] bg-background dark:bg-input/30 border-border"
                    />
                </div>
            </div>

            <LateReturnStats data={data} isLoading={isLoading} />
        </div>
    );
}

export function LateReturnStatisticsContent() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <StatisticsContent />
        </Suspense>
    );
}
