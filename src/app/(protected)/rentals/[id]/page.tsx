'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useRental } from '@/lib/hooks';
import { RentalDetail, RentalDetailSkeleton } from '@/components/rentals';
import { Skeleton } from '@/components/ui/skeleton';

interface RentalDetailPageProps {
    params: Promise<{ id: string }>;
}

function Breadcrumb({ rentalId }: { rentalId: number }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                <li>
                    <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                    <Link
                        href="/rentals"
                        className="hover:text-foreground transition-colors"
                    >
                        Rentals
                    </Link>
                </li>
                <li>
                    <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                    <span className="text-foreground font-medium">
                        Order #{rentalId}
                    </span>
                </li>
            </ol>
        </nav>
    );
}

function BreadcrumbSkeleton() {
    return (
        <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

export default function RentalDetailPage({ params }: RentalDetailPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const rentalId = parseInt(id, 10);

    if (isNaN(rentalId)) {
        notFound();
    }

    const { data: rental, isLoading, error } = useRental(rentalId);

    const handleCancelSuccess = () => {
        router.push('/rentals');
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <BreadcrumbSkeleton />
                <RentalDetailSkeleton />
            </div>
        );
    }

    if (error || !rental) {
        notFound();
    }

    return (
        <div className="container py-8">
            <Breadcrumb rentalId={rental.id} />
            <RentalDetail rental={rental} onCancelSuccess={handleCancelSuccess} />
        </div>
    );
}
