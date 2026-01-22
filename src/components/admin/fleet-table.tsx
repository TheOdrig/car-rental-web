'use client';

import { memo, useState } from 'react';
import { DynamicImage } from '@/components/ui/dynamic-image';
import Link from 'next/link';
import { MoreHorizontal, Edit, RefreshCcw, Car, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Car as CarType, CarStatus } from '@/types';

const statusConfig: Record<CarStatus, { label: string; dotColor: string; textColor: string }> = {
    Available: {
        label: 'Available',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    Rented: {
        label: 'Rented',
        dotColor: 'bg-violet-500',
        textColor: 'text-violet-700 dark:text-violet-400',
    },
    Sold: {
        label: 'Sold',
        dotColor: 'bg-slate-500',
        textColor: 'text-slate-700 dark:text-slate-400',
    },
    Reserved: {
        label: 'Reserved',
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
    },
    Maintenance: {
        label: 'Maintenance',
        dotColor: 'bg-orange-500',
        textColor: 'text-orange-700 dark:text-orange-400',
    },
    Damaged: {
        label: 'Damaged',
        dotColor: 'bg-rose-500',
        textColor: 'text-rose-700 dark:text-rose-400',
    },
    Inspection: {
        label: 'Inspection',
        dotColor: 'bg-cyan-500',
        textColor: 'text-cyan-700 dark:text-cyan-400',
    },
};

const statusOptions: { value: CarStatus; label: string }[] = [
    { value: 'Available', label: 'Available' },
    { value: 'Rented', label: 'Rented' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Damaged', label: 'Damaged' },
    { value: 'Inspection', label: 'Inspection' },
];

interface FleetTableProps {
    cars: CarType[];
    totalCars: number;
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
    const [newStatus, setNewStatus] = useState<CarStatus | null>(null);

    const handleDeleteClick = (car: CarType) => {
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
                "rounded-3xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg",
                className
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Fleet Inventory</CardTitle>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {cars.length} of {totalCars} vehicles
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-200 dark:border-slate-700">
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Car Details</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">License Plate</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Status</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Price/Day</TableHead>
                                    <TableHead className="text-right text-slate-600 dark:text-slate-300 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cars.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Car className="h-8 w-8 opacity-50" />
                                                <p>No vehicles found matching your criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cars.map((car) => (
                                        <TableRow key={car.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {car.imageUrl ? (
                                                        <DynamicImage
                                                            src={car.imageUrl}
                                                            alt={`${car.brand} ${car.model}`}
                                                            width={64}
                                                            height={40}
                                                            className="h-10 w-16 rounded-lg object-cover border bg-muted"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-16 rounded-lg bg-muted flex items-center justify-center border">
                                                            <Car className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold">
                                                            {car.brand} {car.model}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {car.productionYear} • {car.fuelType || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                    {car.licensePlate}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
                                                        "backdrop-blur-md bg-white/80 dark:bg-slate-800/80",
                                                        "border border-slate-200/50 dark:border-slate-700/50 shadow-sm",
                                                        statusConfig[car.carStatusType]?.textColor
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full mr-2",
                                                        statusConfig[car.carStatusType]?.dotColor
                                                    )} />
                                                    {statusConfig[car.carStatusType]?.label || car.carStatusType}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                ${car.price?.toFixed(2) || '0.00'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        aria-label={`Edit ${car.brand} ${car.model}`}
                                                        asChild
                                                    >
                                                        <Link href={`/admin/fleet/${car.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                aria-label={`More actions for ${car.brand} ${car.model}`}
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/fleet/${car.id}/edit`}>
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
                            Showing 1-{cars.length} of {totalCars} results
                        </p>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            { }
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Vehicle from Fleet</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            <span className="font-semibold">
                                {selectedCar?.brand} {selectedCar?.model}
                            </span>{' '}
                            ({selectedCar?.licensePlate}) from the fleet? This action cannot be undone.
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

            { }
            <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <AlertDialogContent>
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
                                value={newStatus || undefined}
                                onValueChange={(v) => setNewStatus(v as CarStatus)}
                            >
                                <SelectTrigger className="w-full mt-4">
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
