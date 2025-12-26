'use client';

import { memo } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Edit, RefreshCcw, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CarStatus = 'available' | 'rented' | 'maintenance' | 'damaged';

interface FleetCar {
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    status: CarStatus;
    location: string;
    imageUrl?: string;
    fuelType: string;
    lastService?: string;
}

interface FleetTableProps {
    searchQuery?: string;
    statusFilter?: string;
    brandFilter?: string;
    isLoading?: boolean;
    className?: string;
}

const mockCars: FleetCar[] = [
    {
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        licensePlate: 'ABC-1234',
        status: 'available',
        location: 'Downtown Lot A',
        fuelType: 'Hybrid',
    },
    {
        id: 2,
        brand: 'BMW',
        model: '3 Series',
        year: 2022,
        licensePlate: 'XYZ-5678',
        status: 'rented',
        location: 'Customer: John D.',
        fuelType: 'Gasoline',
    },
    {
        id: 3,
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        licensePlate: 'EV-9012',
        status: 'maintenance',
        location: 'Service Center',
        fuelType: 'Electric',
        lastService: '2024-01-15',
    },
    {
        id: 4,
        brand: 'Mercedes',
        model: 'C-Class',
        year: 2023,
        licensePlate: 'LUX-3456',
        status: 'damaged',
        location: 'Repair Shop',
        fuelType: 'Diesel',
    },
];

const statusConfig: Record<CarStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    available: {
        label: 'Available',
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600 animate-pulse',
    },
    rented: {
        label: 'On Road',
        variant: 'secondary',
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    maintenance: {
        label: 'Maintenance',
        variant: 'outline',
        className: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20',
    },
    damaged: {
        label: 'Damaged',
        variant: 'destructive',
        className: '',
    },
};

export const FleetTable = memo(function FleetTable({
    searchQuery = '',
    statusFilter = 'all',
    brandFilter = 'all',
    isLoading = false,
    className,
}: FleetTableProps) {
    const filteredCars = mockCars.filter((car) => {
        const matchesSearch =
            searchQuery === '' ||
            `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || car.status === statusFilter;

        const matchesBrand =
            brandFilter === 'all' || car.brand.toLowerCase() === brandFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesBrand;
    });

    if (isLoading) {
        return <FleetTableSkeleton className={className} />;
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Fleet Inventory</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Showing {filteredCars.length} of {mockCars.length} vehicles
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Car Details</TableHead>
                                <TableHead>License Plate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCars.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Car className="h-8 w-8 opacity-50" />
                                            <p>No vehicles found matching your criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCars.map((car) => (
                                    <TableRow key={car.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {car.imageUrl ? (
                                                    <Image
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
                                                        {car.year} • {car.fuelType}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                {car.licensePlate}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(statusConfig[car.status].className)}>
                                                {statusConfig[car.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {car.location}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    aria-label={`Edit ${car.brand} ${car.model}`}
                                                >
                                                    <Edit className="h-4 w-4" />
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
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                                            Change Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
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
                        Showing 1-{filteredCars.length} of {mockCars.length} results
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
