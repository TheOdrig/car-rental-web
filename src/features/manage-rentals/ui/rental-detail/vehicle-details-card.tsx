'use client';

import Link from 'next/link';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Rental } from '@/entities/rental';

interface VehicleDetailsCardProps {
    carSummary: Rental['carSummary'];
}

export function VehicleDetailsCard({ carSummary }: VehicleDetailsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Link href={`/cars/${carSummary?.id}`} className="group flex gap-4">
                    <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg">
                        <DynamicImage
                            src={carSummary?.thumbnailUrl ?? '/images/car-placeholder.svg'}
                            alt={`${carSummary?.brand} ${carSummary?.model}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xl font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-primary">
                            {carSummary?.brand} {carSummary?.model}
                        </p>
                        <p className="text-muted-foreground">
                            {carSummary?.licensePlate}
                        </p>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}
