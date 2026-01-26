'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CarFormData } from './types';

interface SpecificationsSectionProps {
    data: CarFormData;
    errors: Partial<Record<keyof CarFormData, string>>;
    onUpdate: (field: keyof CarFormData, value: string | number) => void;
}

const fuelTypes = [
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
];

const transmissionTypes = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' },
    { value: 'cvt', label: 'CVT' },
];

const bodyTypes = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'coupe', label: 'Coupe' },
    { value: 'convertible', label: 'Convertible' },
    { value: 'wagon', label: 'Wagon' },
    { value: 'pickup', label: 'Pickup Truck' },
    { value: 'van', label: 'Van' },
];

const colors = [
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'silver', label: 'Silver' },
    { value: 'gray', label: 'Gray' },
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'brown', label: 'Brown' },
    { value: 'beige', label: 'Beige' },
    { value: 'other', label: 'Other' },
];

const seatOptions = [2, 4, 5, 6, 7, 8];

export function SpecificationsSection({ data, errors, onUpdate }: SpecificationsSectionProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fuelType">
                        Fuel Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.fuelType}
                        onValueChange={(value) => onUpdate('fuelType', value)}
                    >
                        <SelectTrigger
                            id="fuelType"
                            className={cn(
                                'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                                errors.fuelType && 'border-destructive'
                            )}
                            aria-label="Select fuel type"
                        >
                            <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                            {fuelTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.fuelType && (
                        <p className="text-sm text-destructive">{errors.fuelType}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="transmissionType">
                        Transmission <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.transmissionType}
                        onValueChange={(value) => onUpdate('transmissionType', value)}
                    >
                        <SelectTrigger
                            id="transmissionType"
                            className={cn(
                                'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                                errors.transmissionType && 'border-destructive'
                            )}
                            aria-label="Select transmission type"
                        >
                            <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                            {transmissionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.transmissionType && (
                        <p className="text-sm text-destructive">{errors.transmissionType}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                        value={data.bodyType}
                        onValueChange={(value) => onUpdate('bodyType', value)}
                    >
                        <SelectTrigger id="bodyType" aria-label="Select body type" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                            <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                            {bodyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Select
                        value={data.seats.toString()}
                        onValueChange={(value) => onUpdate('seats', parseInt(value))}
                    >
                        <SelectTrigger id="seats" aria-label="Select number of seats" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                            <SelectValue placeholder="Select seats" />
                        </SelectTrigger>
                        <SelectContent>
                            {seatOptions.map((seats) => (
                                <SelectItem key={seats} value={seats.toString()}>
                                    {seats} seats
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                    value={data.color}
                    onValueChange={(value) => onUpdate('color', value)}
                >
                    <SelectTrigger id="color" aria-label="Select color" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                        {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full border"
                                        style={{
                                            backgroundColor: color.value === 'other' ? 'transparent' : color.value,
                                        }}
                                    />
                                    {color.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

