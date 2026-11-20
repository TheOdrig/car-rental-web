'use client';

import Link from 'next/link';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { Car, ExternalLink, Fuel, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { CopyButton } from '@/shared/ui/copy-button';
import type { RentalVehicleInfo } from '@/entities/rental';
import { CarStatusBadge } from '@/entities/car';

interface VehicleInfoCardProps {
    vehicle: RentalVehicleInfo;
}

export function VehicleInfoCard({ vehicle }: VehicleInfoCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        Vehicle
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/fleet/${vehicle.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    {vehicle.imageUrl ? (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <DynamicImage
                                src={vehicle.imageUrl}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Car className="h-8 w-8 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {vehicle.brand} {vehicle.model}
                            {vehicle.year ? <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">{vehicle.year}</span> : null}
                        </div>
                        {vehicle.status && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Fleet status</span>
                                <CarStatusBadge status={vehicle.status} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">License</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-slate-100">{vehicle.licensePlate}</span>
                    <CopyButton value={vehicle.licensePlate} />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {vehicle.fuelType && (
                        <div className="flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            <span>{vehicle.fuelType}</span>
                        </div>
                    )}
                    {vehicle.transmissionType && (
                        <div className="flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            <span>{vehicle.transmissionType}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}