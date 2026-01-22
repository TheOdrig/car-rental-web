'use client';

import Link from 'next/link';
import { CalendarCheck, User, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { safeFormatDate } from '@/lib/utils/format';
import type { VehicleActiveRental } from '@/types';

interface VehicleActiveRentalCardProps {
    activeRental: VehicleActiveRental;
}

export function VehicleActiveRentalCard({ activeRental }: VehicleActiveRentalCardProps) {
    return (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
                        <CalendarCheck className="h-5 w-5" />
                        Active Rental
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild className="border-blue-300 dark:border-blue-700">
                        <Link href={`/admin/rentals/${activeRental.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Rental
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Rental ID:</span>
                        <Link
                            href={`/admin/rentals/${activeRental.id}`}
                            className="font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            CR-{String(activeRental.id).padStart(6, '0')}
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Customer:</span>
                    <Link
                        href={`/admin/users/${activeRental.customerId}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {activeRental.customerName}
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Start Date</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {safeFormatDate(activeRental.startDate)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">End Date</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {safeFormatDate(activeRental.endDate)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        {activeRental.daysRemaining} days remaining
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
