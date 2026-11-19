'use client';

import React from 'react';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib';
import { uniqueOptions, useFilterOptions } from '@/entities/car';
import type { CarFormData } from '../../model/types';

interface SpecificationsSectionProps {
    data: CarFormData;
    errors: Partial<Record<keyof CarFormData, string>>;
    onUpdate: (field: keyof CarFormData, value: string | number) => void;
}

const BASE_FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const BASE_TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const BASE_BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van'];
const BASE_COLORS = ['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Other'];

interface OptionSet {
    options: { value: string; label: string }[];
    selected: string;
}

export function buildOptions(base: readonly string[], fromApi: readonly string[] | undefined, current: string): OptionSet {
    const merged = uniqueOptions([...base, ...(fromApi ?? [])]);
    const key = current.trim().toLowerCase();
    const match = merged.find((option) => option.toLowerCase() === key);
    const list = match || !key ? merged : [...merged, current];
    return {
        options: list.map((value) => ({ value, label: value })),
        selected: match ?? current,
    };
}

const seatOptions = [2, 4, 5, 6, 7, 8];

export function SpecificationsSection({ data, errors, onUpdate }: SpecificationsSectionProps) {
    const { data: filterOptions } = useFilterOptions();
    const fuel = buildOptions(BASE_FUEL_TYPES, filterOptions?.fuelTypes, data.fuelType);
    const transmission = buildOptions(BASE_TRANSMISSIONS, filterOptions?.transmissionTypes, data.transmissionType);
    const body = buildOptions(BASE_BODY_TYPES, filterOptions?.bodyTypes, data.bodyType);
    const color = buildOptions(BASE_COLORS, undefined, data.color);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fuelType">
                        Fuel Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={fuel.selected}
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
                            {fuel.options.map((type) => (
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
                        value={transmission.selected}
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
                            {transmission.options.map((type) => (
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
                        value={body.selected}
                        onValueChange={(value) => onUpdate('bodyType', value)}
                    >
                        <SelectTrigger id="bodyType" aria-label="Select body type" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                            <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                            {body.options.map((type) => (
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
                    value={color.selected}
                    onValueChange={(value) => onUpdate('color', value)}
                >
                    <SelectTrigger id="color" aria-label="Select color" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                        {color.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full border"
                                        style={{
                                            backgroundColor: option.value === 'Other' ? 'transparent' : option.value.toLowerCase(),
                                        }}
                                    />
                                    {option.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}