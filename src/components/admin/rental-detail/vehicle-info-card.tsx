'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Car, ExternalLink, Fuel, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/admin';
import type { RentalVehicleInfo, CarStatus } from '@/types';

interface VehicleInfoCardProps {
    vehicle: RentalVehicleInfo;
}

const statusColors: Record<CarStatus, string> = {
    Available: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    Rented: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    Maintenance: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    Reserved: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    Sold: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30',
    Damaged: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    Inspection: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
};

export function VehicleInfoCard({ vehicle }: VehicleInfoCardProps) {
    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Car className="h-5 w-5 text-indigo-500" />
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
                            <Image
                                src={vehicle.imageUrl}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                fill
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
                        </div>
                        <Badge className={statusColors[vehicle.status]} variant="secondary">
                            {vehicle.status}
                        </Badge>
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
