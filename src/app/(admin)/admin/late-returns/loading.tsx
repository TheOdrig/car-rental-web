import { Skeleton } from '@/components/ui/skeleton';

export default function LateReturnsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />

            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/30 dark:bg-slate-900/30">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            <div className="flex gap-3">
                <Skeleton className="h-9 w-[150px]" />
                <Skeleton className="h-9 w-[150px]" />
                <Skeleton className="h-9 w-[150px]" />
                <Skeleton className="h-9 w-[150px]" />
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-12 w-[200px]" />
                            <Skeleton className="h-12 w-[150px]" />
                            <Skeleton className="h-12 w-[100px]" />
                            <Skeleton className="h-12 w-[80px]" />
                            <Skeleton className="h-12 w-[100px]" />
                            <Skeleton className="h-12 w-[100px]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

