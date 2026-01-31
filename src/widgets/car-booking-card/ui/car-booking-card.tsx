'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuth } from '@/features/auth';
import { RentalForm } from '@/features/manage-rentals';
import { type Car } from '@/entities/car';

interface CarBookingCardProps {
    car: Car;
}

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function CarBookingCard({ car }: CarBookingCardProps) {
    const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const showAuthLoading = !mounted || isAuthLoading;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Book This Car</CardTitle>
            </CardHeader>
            <CardContent>
                {showAuthLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : isAuthenticated ? (
                    <RentalForm car={car} />
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">
                            Please log in to book this car
                        </p>
                        <Button asChild>
                            <Link href={`/login?callbackUrl=/cars/${car.id}`}>
                                <LogIn className="h-4 w-4 mr-2" />
                                Log In to Book
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
