'use client';

import Link from 'next/link';
import { Car, User } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { TableCell, TableRow } from '@/shared/ui/table';
import { formatDate, formatRentalReference, formatAmount } from '@/shared/lib';
import type { PendingItem } from '@/entities/rental';
import { getStatusDisplay, type PendingRentalsType } from './format';
import { PendingRentalAction, type PendingAction } from './pending-rental-action';

interface PendingRentalRowProps {
    item: PendingItem;
    type: PendingRentalsType;
    isProcessing: boolean;
    onAction: (item: PendingItem, action: PendingAction) => void;
}

const LINK_CLASS =
    'block truncate text-sm font-semibold transition-colors hover:text-primary hover:underline';

export function PendingRentalRow({ item, type, isProcessing, onAction }: PendingRentalRowProps) {
    const display = getStatusDisplay(item.status);

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 max-w-[14rem]">
                        {item.customerId && item.customerId > 0 ? (
                            <Link href={`/admin/users/${item.customerId}`} className={LINK_CLASS}>
                                {item.customerName}
                            </Link>
                        ) : (
                            <span className="block truncate text-sm font-semibold">{item.customerName}</span>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{item.customerEmail}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    {item.carImage ? (
                        <div className="relative h-10 w-16 shrink-0">
                            <DynamicImage
                                src={item.carImage}
                                alt={`${item.carBrand} ${item.carModel}`}
                                fill
                                className="rounded-lg object-cover border bg-muted shadow-sm"
                                sizes="64px"
                            />
                        </div>
                    ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
                            <Car className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                    )}
                    <div className="min-w-0 max-w-[14rem]">
                        <Link href={`/admin/fleet/${item.carId}`} className={LINK_CLASS}>
                            {item.carBrand} {item.carModel}
                        </Link>
                        <Link
                            href={`/admin/rentals/${item.rentalId}`}
                            className="block text-[10px] font-bold uppercase tracking-tight text-muted-foreground transition-colors hover:text-primary"
                        >
                            {item.licensePlate} • {formatRentalReference(item.rentalId)}
                        </Link>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="whitespace-nowrap text-sm">
                    <p>{formatDate(item.startDate)}</p>
                    <p className="text-muted-foreground">to {formatDate(item.endDate)}</p>
                </div>
            </TableCell>
            <TableCell className="font-medium">{formatAmount(item.totalAmount)}</TableCell>
            <TableCell>
                <Badge variant={display.variant} className={display.className}>
                    {display.label}
                </Badge>
            </TableCell>
            {type === 'overdue' && (
                <TableCell>
                    <Badge variant="destructive">{item.lateHours}h late</Badge>
                </TableCell>
            )}
            <TableCell className="text-right">
                <PendingRentalAction item={item} type={type} isProcessing={isProcessing} onAction={onAction} />
            </TableCell>
        </TableRow>
    );
}
