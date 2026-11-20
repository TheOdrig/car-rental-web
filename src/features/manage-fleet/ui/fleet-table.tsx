'use client';

import { memo, useRef, useState } from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import Link from 'next/link';
import { MoreHorizontal, Edit, RefreshCcw, Car, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn, formatCurrencyWithDecimals, formatRentalReference } from '@/shared/lib';
import { CAR_STATUSES, CAR_SERVICE_STATUS_LABELS, carOccupancyLabel, type AdminCar as CarType, type CarStatus } from '@/entities/car';
import { Pagination } from '@/shared/ui/pagination';
import { EmptyState } from '@/shared/ui/empty-state';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';

const statusConfig: Record<CarStatus, { dotColor: string; textColor: string }> = {
    AVAILABLE: {
        dotColor: 'bg-success',
        textColor: 'text-success-subtle-foreground',
    },
    MAINTENANCE: {
        dotColor: 'bg-warning',
        textColor: 'text-warning-subtle-foreground',
    },
    DAMAGED: {
        dotColor: 'bg-destructive',
        textColor: 'text-danger-subtle-foreground',
    },
    INSPECTION: {
        dotColor: 'bg-info',
        textColor: 'text-info-subtle-foreground',
    },
};

const statusOptions = CAR_STATUSES.map((value) => ({ value, label: CAR_SERVICE_STATUS_LABELS[value] }));

interface FleetTableProps {
    cars: CarType[];
    totalCars: number;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    className?: string;
    onDeleteCar: (carId: number) => void;
    onUpdateStatus: (carId: number, status: CarStatus) => void;
    isDeleting?: boolean;
    isUpdatingStatus?: boolean;
}

export const FleetTable = memo(function FleetTable({
    cars,
    totalCars,
    page = 0,
    totalPages = 1,
    onPageChange,
    isLoading = false,
    className,
    onDeleteCar,
    onUpdateStatus,
    isDeleting = false,
    isUpdatingStatus = false,
}: FleetTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
    const lastActionCarId = useRef<number | null>(null);
    const [newStatus, setNewStatus] = useState<CarStatus | null>(null);

    const returnFocusToRowMenu = (event: Event) => {
        const carId = lastActionCarId.current;
        const trigger = carId === null ? null : document.querySelector<HTMLElement>(`[data-car-actions="${carId}"]`);
        if (trigger) {
            event.preventDefault();
            trigger.focus();
        }
    };

    const handleDeleteClick = (car: CarType) => {
        lastActionCarId.current = car.id;
        setSelectedCar(car);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedCar) {
            onDeleteCar(selectedCar.id);
            setDeleteDialogOpen(false);
            setSelectedCar(null);
        }
    };

    const handleStatusClick = (car: CarType) => {
        lastActionCarId.current = car.id;
        setSelectedCar(car);
        setNewStatus(car.carStatusType);
        setStatusDialogOpen(true);
    };

    const handleStatusConfirm = () => {
        if (selectedCar && newStatus && newStatus !== selectedCar.carStatusType) {
            onUpdateStatus(selectedCar.id, newStatus);
            setStatusDialogOpen(false);
            setSelectedCar(null);
            setNewStatus(null);
        }
    };

    if (isLoading) {
        return <FleetTableSkeleton className={className} />;
    }

    return (
        <>
            <Card className={cn(
                "rounded-lg bg-card border border-border shadow-sm",
                className
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-foreground">Fleet Inventory</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Showing {cars.length} of {totalCars} vehicles
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="stack-table">
                            <TableHeader>
                                <TableRow className="border-b border-border">
                                    <TableHead className="text-muted-foreground font-semibold">Car Details</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">License Plate</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Service</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Occupancy</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Price/Day</TableHead>
                                    <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cars.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyState size="compact" icon={Car} title="No vehicles found" description="No vehicles match your criteria" />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cars.map((car) => (
                                        <TableRow key={car.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {car.thumbnailUrl || car.imageUrl ? (
                                                        <DynamicImage
                                                            src={(car.thumbnailUrl || car.imageUrl)!}
                                                            alt={`${car.brand} ${car.model}`}
                                                            width={64}
                                                            height={40}
                                                            sizes="64px"
                                                            className="h-10 w-16 rounded-lg object-cover border bg-muted"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-16 rounded-lg bg-muted flex items-center justify-center border">
                                                            <Car className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={ROUTES.admin.fleetDetail(car.id)}
                                                            className="inline-flex min-h-11 items-center font-semibold hover:text-primary hover:underline transition-colors md:min-h-0"
                                                        >
                                                            {car.brand} {car.model}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            {car.productionYear} • {car.fuelType || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell data-label="License Plate">
                                                <code className="font-mono text-sm bg-muted text-foreground px-2 py-1 rounded border border-border">
                                                    {car.licensePlate}
                                                </code>
                                            </TableCell>
                                            <TableCell data-label="Service">
                                                <div
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
                                                        " bg-card",
                                                        "border border-border shadow-sm",
                                                        statusConfig[car.carStatusType]?.textColor
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full mr-2",
                                                        statusConfig[car.carStatusType]?.dotColor
                                                    )} />
                                                    {CAR_SERVICE_STATUS_LABELS[car.carStatusType] ?? car.carStatusType}
                                                </div>
                                            </TableCell>
                                            <TableCell data-label="Occupancy" className="text-sm">
                                                {car.currentRentalId && car.occupancy && car.occupancy !== 'FREE' ? (
                                                    <Link
                                                        href={ROUTES.admin.rental(car.currentRentalId)}
                                                        className="inline-flex min-h-11 items-center text-primary hover:underline md:min-h-0"
                                                        aria-label={`${carOccupancyLabel(car.occupancy)}, rental ${formatRentalReference(car.currentRentalId)}`}
                                                    >
                                                        {carOccupancyLabel(car.occupancy)}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">{carOccupancyLabel(car.occupancy)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell data-label="Price/Day" className="text-sm font-medium">
                                                {formatCurrencyWithDecimals(car.price ?? 0, car.currencyType ?? DEFAULT_CURRENCY)}
                                            </TableCell>
                                            <TableCell data-wide className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-11 w-11 p-0 md:h-8 md:w-8"
                                                        aria-label={`Edit ${car.brand} ${car.model}`}
                                                        asChild
                                                    >
                                                        <Link href={ROUTES.admin.fleetEdit(car.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-11 w-11 p-0 md:h-8 md:w-8"
                                                                aria-label={`More actions for ${car.brand} ${car.model}`}
                                                                data-car-actions={car.id}
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={ROUTES.admin.fleetDetail(car.id)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={ROUTES.admin.fleetEdit(car.id)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusClick(car)}>
                                                                <RefreshCcw className="h-4 w-4 mr-2" />
                                                                Change Status
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteClick(car)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove from Fleet
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {cars.length} of {totalCars} vehicles
                        </p>
                        {onPageChange && (
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} scrollToTop={false} />
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent onCloseAutoFocus={returnFocusToRowMenu}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Vehicle from Fleet</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            <span className="font-semibold">
                                {selectedCar?.brand} {selectedCar?.model}
                            </span>{' '}
                            ({selectedCar?.licensePlate}) from the fleet? The vehicle is archived and can be restored right after removal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <AlertDialogContent onCloseAutoFocus={returnFocusToRowMenu}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Vehicle Status</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <span>
                                Update the status for{' '}
                                <span className="font-semibold">
                                    {selectedCar?.brand} {selectedCar?.model}
                                </span>
                            </span>
                            <Select
                                value={newStatus ?? ''}
                                onValueChange={(v) => setNewStatus(v as CarStatus)}
                            >
                                <SelectTrigger aria-label="New status" className="w-full mt-4">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusConfirm}
                            disabled={isUpdatingStatus || newStatus === selectedCar?.carStatusType}
                        >
                            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});

function FleetTableSkeleton({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <Skeleton className="h-10 w-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export { FleetTableSkeleton };