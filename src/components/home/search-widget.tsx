'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, MapPin, Car, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const VEHICLE_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Convertible', label: 'Convertible' },
    { value: 'Van', label: 'Van' },
];

interface SearchWidgetProps {
    className?: string;
}

export function SearchWidget({ className }: SearchWidgetProps) {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [pickupDate, setPickupDate] = useState<Date>();
    const [returnDate, setReturnDate] = useState<Date>();
    const [vehicleType, setVehicleType] = useState('all');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!pickupDate) {
            newErrors.pickupDate = 'Pickup date is required';
        }
        if (!returnDate) {
            newErrors.returnDate = 'Return date is required';
        }
        if (pickupDate && returnDate && pickupDate >= returnDate) {
            newErrors.returnDate = 'Return date must be after pickup date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearch = () => {
        if (!validateForm()) return;

        const params = new URLSearchParams();

        if (location) {
            params.set('location', location);
        }
        if (pickupDate) {
            params.set('startDate', format(pickupDate, 'yyyy-MM-dd'));
        }
        if (returnDate) {
            params.set('endDate', format(returnDate, 'yyyy-MM-dd'));
        }
        if (vehicleType && vehicleType !== 'all') {
            params.set('bodyType', vehicleType);
        }

        const queryString = params.toString();
        router.push(queryString ? `/cars?${queryString}` : '/cars');
    };

    return (
        <div
            className={cn(
                'bg-white dark:bg-slate-900 backdrop-blur-sm rounded-xl p-6 shadow-2xl border dark:border-slate-700',
                className
            )}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400" />
                        <Input
                            placeholder="City or airport"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Pickup Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                    !pickupDate && 'text-muted-foreground dark:text-slate-400',
                                    errors.pickupDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickupDate ? format(pickupDate, 'MMM dd, yyyy') : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={pickupDate}
                                onSelect={(date) => {
                                    setPickupDate(date);
                                    setErrors((prev) => ({ ...prev, pickupDate: '' }));
                                }}
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.pickupDate && (
                        <p className="text-xs text-destructive mt-1">{errors.pickupDate}</p>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Return Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                    !returnDate && 'text-muted-foreground dark:text-slate-400',
                                    errors.returnDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {returnDate ? format(returnDate, 'MMM dd, yyyy') : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={returnDate}
                                onSelect={(date) => {
                                    setReturnDate(date);
                                    setErrors((prev) => ({ ...prev, returnDate: '' }));
                                }}
                                disabled={(date) =>
                                    date < new Date() || (pickupDate ? date <= pickupDate : false)
                                }
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.returnDate && (
                        <p className="text-xs text-destructive mt-1">{errors.returnDate}</p>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Vehicle Type
                    </label>
                    <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400 z-10" />
                        <Select value={vehicleType} onValueChange={setVehicleType}>
                            <SelectTrigger className="pl-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {VEHICLE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="lg:col-span-1 flex items-end">
                    <Button
                        onClick={handleSearch}
                        size="lg"
                        className="w-full h-10"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>
        </div>
    );
}
