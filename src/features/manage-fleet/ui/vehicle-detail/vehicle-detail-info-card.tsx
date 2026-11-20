'use client';

import { Car, Fuel, Settings2, Users, Palette, Hash, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CopyButton } from '@/shared/ui/copy-button';
import { formatCurrency } from '@/shared/lib';
import type { VehicleDetailResponse } from '@/entities/car';
import { CarStatusBadge } from '@/entities/car';

interface VehicleDetailInfoCardProps {
    vehicle: VehicleDetailResponse;
}

export function VehicleDetailInfoCard({ vehicle }: VehicleDetailInfoCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    Vehicle Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Vehicle ID</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono font-medium text-foreground">
                            #{vehicle.id}
                        </span>
                        <CopyButton value={String(vehicle.id)} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <CarStatusBadge status={vehicle.status} />
                </div>

                <div className="border-t border-border pt-4">
                    <h2 className="text-sm font-medium text-foreground mb-3">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">License Plate</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono text-sm text-foreground">{vehicle.licensePlate}</span>
                                    <CopyButton value={vehicle.licensePlate} />
                                </div>
                            </div>
                        </div>
                        {vehicle.vin && (
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-xs text-muted-foreground block">VIN</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono text-xs text-foreground truncate max-w-[100px]">{vehicle.vin}</span>
                                        <CopyButton value={vehicle.vin} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">Fuel Type</span>
                                <span className="text-sm text-foreground">{vehicle.fuelType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">Transmission</span>
                                <span className="text-sm text-foreground">{vehicle.transmissionType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">Body Type</span>
                                <span className="text-sm text-foreground">{vehicle.bodyType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">Seats</span>
                                <span className="text-sm text-foreground">{vehicle.seats}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-xs text-muted-foreground block">Color</span>
                                <span className="text-sm text-foreground">{vehicle.color}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {vehicle.pricing && (
                    <div className="border-t border-border pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Pricing</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <span className="text-xs text-muted-foreground block">Daily Rate</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {formatCurrency(vehicle.pricing.dailyRate, vehicle.pricing.currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}