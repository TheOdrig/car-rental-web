'use client';

import Link from 'next/link';
import { Car, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyRentals } from '@/lib/hooks';
import { RentalCard, RentalCardSkeleton } from '@/components/rentals';

export default function UserDashboardPage() {
    const { data, isLoading } = useMyRentals({ size: 3 });

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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{totalRentals}</div>
                        )}
                    </CardContent>
                </Card>

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

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Rentals</CardTitle>
                    {totalRentals > 3 && (
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
                    ) : recentRentals.length === 0 ? (
                        <div className="text-center py-8">
                            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No rentals yet</p>
                            <Button asChild>
                                <Link href="/cars">Browse Cars</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentRentals.map((rental) => (
                                <RentalCard key={rental.id} rental={rental} variant="compact" />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

