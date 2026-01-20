import { Skeleton } from '@/components/ui/skeleton';

export default function StatisticsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />

            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/30 dark:bg-slate-900/30">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-[160px]" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-[160px]" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
