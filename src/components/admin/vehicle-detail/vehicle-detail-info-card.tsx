'use client';

import { Car, Fuel, Settings2, Users, Palette, Hash, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/admin';
import { formatCurrency } from '@/lib/utils/format';
import type { VehicleDetailResponse, CarStatus } from '@/types';

interface VehicleDetailInfoCardProps {
    vehicle: VehicleDetailResponse;
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

export function VehicleDetailInfoCard({ vehicle }: VehicleDetailInfoCardProps) {
    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="h-5 w-5 text-indigo-500" />
                    Vehicle Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Vehicle ID</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            #{vehicle.id}
                        </span>
                        <CopyButton value={String(vehicle.id)} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                    <Badge className={statusColors[vehicle.status]} variant="secondary">
                        {vehicle.status}
                    </Badge>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">License Plate</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono text-sm text-slate-900 dark:text-slate-100">{vehicle.licensePlate}</span>
                                    <CopyButton value={vehicle.licensePlate} />
                                </div>
                            </div>
                        </div>
                        {vehicle.vin && (
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-slate-400" />
                                <div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block">VIN</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono text-xs text-slate-900 dark:text-slate-100 truncate max-w-[100px]">{vehicle.vin}</span>
                                        <CopyButton value={vehicle.vin} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Fuel Type</span>
                                <span className="text-sm text-slate-900 dark:text-slate-100">{vehicle.fuelType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Transmission</span>
                                <span className="text-sm text-slate-900 dark:text-slate-100">{vehicle.transmissionType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Body Type</span>
                                <span className="text-sm text-slate-900 dark:text-slate-100">{vehicle.bodyType}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Seats</span>
                                <span className="text-sm text-slate-900 dark:text-slate-100">{vehicle.seats}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Color</span>
                                <span className="text-sm text-slate-900 dark:text-slate-100">{vehicle.color}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pricing</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Daily Rate</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(vehicle.pricing.dailyRate, vehicle.pricing.currency)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Weekly Rate</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(vehicle.pricing.weeklyRate, vehicle.pricing.currency)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Deposit</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(vehicle.pricing.depositAmount, vehicle.pricing.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
