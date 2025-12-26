'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
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

interface BasicInfoSectionProps {
    data: CarFormData;
    errors: Partial<Record<keyof CarFormData, string>>;
    onUpdate: (field: keyof CarFormData, value: string | number) => void;
}

const carBrands = [
    'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi',
    'Tesla', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai',
    'Volkswagen', 'Porsche', 'Lexus', 'Mazda', 'Subaru',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function BasicInfoSection({ data, errors, onUpdate }: BasicInfoSectionProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="brand">
                        Brand <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.brand}
                        onValueChange={(value) => onUpdate('brand', value)}
                    >
                        <SelectTrigger
                            id="brand"
                            className={cn(errors.brand && 'border-destructive')}
                            aria-label="Select brand"
                        >
                            <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                            {carBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                    {brand}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.brand && (
                        <p className="text-sm text-destructive">{errors.brand}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="model">
                        Model <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="model"
                        value={data.model}
                        onChange={(e) => onUpdate('model', e.target.value)}
                        placeholder="e.g., Camry, Model 3"
                        className={cn(errors.model && 'border-destructive')}
                    />
                    {errors.model && (
                        <p className="text-sm text-destructive">{errors.model}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="year">
                        Year <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.year.toString()}
                        onValueChange={(value) => onUpdate('year', parseInt(value))}
                    >
                        <SelectTrigger id="year" aria-label="Select year">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="licensePlate">
                        License Plate <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="licensePlate"
                        value={data.licensePlate}
                        onChange={(e) => onUpdate('licensePlate', e.target.value.toUpperCase())}
                        placeholder="e.g., ABC-1234"
                        className={cn(
                            'font-mono uppercase',
                            errors.licensePlate && 'border-destructive'
                        )}
                    />
                    {errors.licensePlate && (
                        <p className="text-sm text-destructive">{errors.licensePlate}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input
                    id="vin"
                    value={data.vin}
                    onChange={(e) => onUpdate('vin', e.target.value.toUpperCase())}
                    placeholder="17-character VIN"
                    maxLength={17}
                    className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                    Optional: 17-character vehicle identification number
                </p>
            </div>
        </div>
    );
}
