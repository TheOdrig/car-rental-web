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
                <Link href={`/cars/${carSummary?.id}`} className="group flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-40 w-full shrink-0 sm:h-32 sm:w-48 overflow-hidden rounded-lg">
                        <DynamicImage
                            src={carSummary?.thumbnailUrl ?? '/images/car-placeholder.svg'}
                            alt={`${carSummary?.brand} ${carSummary?.model}`}
                            fill
                            sizes="(min-width: 640px) 192px, 100vw"
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
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
