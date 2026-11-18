'use client';

import Link from 'next/link';
import { Fuel, Settings2, Users } from 'lucide-react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Rental } from '@/entities/rental';

interface VehicleDetailsCardProps {
    carSummary: Rental['carSummary'];
}

const SPEC_BADGE_CLASS =
    'gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';

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
                        <p className="mb-3 text-muted-foreground">
                            {carSummary?.productionYear} • {carSummary?.licensePlate}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="outline" className={SPEC_BADGE_CLASS}>
                                <Fuel className="h-3 w-3" aria-hidden="true" />
                                {carSummary?.color || 'Gasoline'}
                            </Badge>
                            <Badge variant="outline" className={SPEC_BADGE_CLASS}>
                                <Settings2 className="h-3 w-3" aria-hidden="true" />
                                Automatic
                            </Badge>
                            <Badge variant="outline" className={SPEC_BADGE_CLASS}>
                                <Users className="h-3 w-3" aria-hidden="true" />
                                5 Seats
                            </Badge>
                        </div>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}
