'use client';

import Link from 'next/link';
import { ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RentalCard, RentalCardSkeleton } from '@/features/manage-rentals';
import type { Rental } from '@/types';

interface RecentRentalsProps {
    rentals: Rental[];
    totalCount: number;
    isLoading?: boolean;
}

export function RecentRentals({ rentals, totalCount, isLoading }: RecentRentalsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Rentals</CardTitle>
                {totalCount > 3 && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/rentals" className="flex items-center gap-1">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <RentalCardSkeleton key={i} variant="compact" />
                        ))}
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="text-center py-8">
                        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No rentals yet</p>
                        <Button asChild>
                            <Link href="/cars">Browse Cars</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rentals.map((rental) => (
                            <RentalCard key={rental.id} rental={rental} variant="compact" />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
