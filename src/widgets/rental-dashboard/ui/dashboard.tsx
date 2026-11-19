'use client';

import Link from 'next/link';
import { Calendar, Car } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ErrorMessage } from '@/shared/ui/error-message';
import { useMyRentals } from '@/entities/rental';
import { StatsCard } from './stats-card';
import { RecentRentals } from './recent-rentals';

export function Dashboard() {
    const { data, isLoading, isError, refetch } = useMyRentals({ size: 3 });

    const recentRentals = data?.content ?? [];
    const totalRentals = data?.totalElements ?? 0;

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here&apos;s an overview of your rentals.
                </p>
            </div>

            {isError && (
                <ErrorMessage
                    className="mb-8"
                    title="Failed to load your rentals"
                    message="Your rentals could not be loaded."
                    onRetry={() => void refetch()}
                />
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {!isError && (
                    <StatsCard
                        title="Total Rentals"
                        value={totalRentals}
                        icon={Calendar}
                        isLoading={isLoading}
                    />
                )}

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/cars">Browse Cars</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/rentals">View All Rentals</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!isError && (
                <RecentRentals
                    rentals={recentRentals}
                    totalCount={totalRentals}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}