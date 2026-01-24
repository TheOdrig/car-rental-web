import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DetailPageSkeletonProps {
    className?: string;
}

export function DetailPageSkeleton({ className }: DetailPageSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>

            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
            </div>

            <SkeletonCard lines={6} className="col-span-full" />
        </div>
    );
}

function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <Card className={cn('border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm', className)}>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 - i * 10}%` }} />
                ))}
            </CardContent>
        </Card>
    );
}

export function CardSkeleton({ className }: { className?: string }) {
    return <SkeletonCard className={className} />;
}

export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <Card className={cn('border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm', className)}>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
