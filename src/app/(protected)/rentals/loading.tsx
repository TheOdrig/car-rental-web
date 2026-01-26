import { Skeleton } from '@/components/ui/skeleton';

export default function RentalsLoading() {
    return (
        <div className="container py-8">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-36 hidden md:block" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>

            <div className="flex gap-4 border-b pb-3 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24" />
                ))}
            </div>

            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <Skeleton className="h-32 w-48 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

