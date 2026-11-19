'use client';

import React from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib';
import type { CarFormData } from '../../model/types';

function isValidImageUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

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
                            aria-invalid={errors.brand ? true : undefined}
                            aria-describedby={errors.brand ? 'brand-error' : undefined}
                            className={cn(
                                'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                                errors.brand && 'border-destructive'
                            )}
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
                        <p id="brand-error" role="alert" className="text-sm text-destructive">{errors.brand}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="model">
                        Model <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="model"
                        aria-invalid={errors.model ? true : undefined}
                        aria-describedby={errors.model ? 'model-error' : undefined}
                        value={data.model}
                        onChange={(e) => onUpdate('model', e.target.value)}
                        placeholder="e.g., Camry, Model 3"
                        className={cn(errors.model && 'border-destructive')}
                    />
                    {errors.model && (
                        <p id="model-error" role="alert" className="text-sm text-destructive">{errors.model}</p>
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
                        <SelectTrigger id="year" aria-label="Select year" className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
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
                        aria-invalid={errors.licensePlate ? true : undefined}
                        aria-describedby={errors.licensePlate ? 'licensePlate-error' : undefined}
                        value={data.licensePlate}
                        onChange={(e) => onUpdate('licensePlate', e.target.value.toUpperCase())}
                        placeholder="e.g., ABC-1234"
                        className={cn(
                            'font-mono uppercase',
                            errors.licensePlate && 'border-destructive'
                        )}
                    />
                    {errors.licensePlate && (
                        <p id="licensePlate-error" role="alert" className="text-sm text-destructive">{errors.licensePlate}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input
                    id="vin"
                    aria-invalid={errors.vin ? true : undefined}
                    aria-describedby={errors.vin ? 'vin-error' : undefined}
                    value={data.vin}
                    onChange={(e) => onUpdate('vin', e.target.value.toUpperCase())}
                    placeholder="17-character VIN"
                    maxLength={17}
                    className={cn('font-mono uppercase', errors.vin && 'border-destructive')}
                />
                {errors.vin && <p id="vin-error" role="alert" className="text-sm text-destructive">{errors.vin}</p>}
                <p className="text-xs text-muted-foreground">
                    Optional: 17-character vehicle identification number
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                    id="imageUrl"
                    aria-invalid={errors.imageUrl ? true : undefined}
                    aria-describedby={errors.imageUrl ? 'imageUrl-error' : undefined}
                    value={data.imageUrl}
                    onChange={(e) => onUpdate('imageUrl', e.target.value)}
                    placeholder="https://example.com/car-image.jpg"
                    className={cn(errors.imageUrl && 'border-destructive')}
                />
                {errors.imageUrl && (
                    <p id="imageUrl-error" role="alert" className="text-sm text-destructive">{errors.imageUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Optional: Direct URL to a car image
                </p>
                {isValidImageUrl(data.imageUrl) && (
                    <div className="mt-3 rounded-lg border overflow-hidden bg-muted relative h-40">
                        <DynamicImage
                            src={data.imageUrl}
                            alt="Car preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}