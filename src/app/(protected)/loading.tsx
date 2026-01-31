import { Skeleton } from '@/shared/ui/skeleton';

export default function ProtectedLoading() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}
