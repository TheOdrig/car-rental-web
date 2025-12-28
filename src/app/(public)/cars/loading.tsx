import { Skeleton } from '@/components/ui/skeleton';

export default function CarsLoading() {
    return (
        <div className="container py-8">
            <div className="flex flex-wrap gap-3 mb-6">
                <Skeleton className="h-10 w-[160px]" />
                <Skeleton className="h-10 w-[160px]" />
                <Skeleton className="h-10 w-[160px]" />
                <Skeleton className="h-10 w-[160px]" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
            </div>
        </div>
    );
}
