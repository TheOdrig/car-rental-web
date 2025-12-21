'use client';

import { useMyRentals } from '@/lib/hooks';
import { RentalList, RentalListSkeleton } from '@/components/rentals';

export default function MyRentalsPage() {
    const { data, isLoading, error } = useMyRentals();

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Rentals</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage your rental history
                </p>
            </div>

            {isLoading && <RentalListSkeleton count={5} />}

            {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                    Failed to load rentals. Please try again later.
                </div>
            )}

            {data && <RentalList rentals={data.content} />}
        </div>
    );
}
