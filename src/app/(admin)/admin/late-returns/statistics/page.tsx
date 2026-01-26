'use client';

import { Suspense, useState } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { LateReturnStats } from '@/components/admin';
import { useLateReturnStatistics } from '@/lib/hooks/use-late-returns';
import { toast } from 'sonner';

function StatisticsContent() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

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
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Late Returns', href: '/admin/late-returns' },
                    { label: 'Statistics' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Late Return Statistics</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Analyze late return trends and penalty metrics
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
                        <Link href="/admin/late-returns">
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300">
                        Start Date
                    </Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-[160px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300">
                        End Date
                    </Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-[160px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                    />
                </div>
            </div>

            <LateReturnStats data={data} isLoading={isLoading} />
        </div>
    );
}

export default function LateReturnStatisticsPage() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <StatisticsContent />
        </Suspense>
    );
}

