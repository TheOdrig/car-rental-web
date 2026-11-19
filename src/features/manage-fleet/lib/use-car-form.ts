'use client';

import { useState, useCallback } from 'react';
import { fieldErrorMap } from '@/shared/api';
import type { CarFormData } from '../model/types';
import { defaultCarFormData } from '../model/types';

export type CarFormErrors = Partial<Record<keyof CarFormData, string>>;

const BACKEND_FIELD_TO_FORM: Record<string, keyof CarFormData> = {
    brand: 'brand',
    model: 'model',
    productionYear: 'year',
    licensePlate: 'licensePlate',
    vinNumber: 'vin',
    fuelType: 'fuelType',
    transmissionType: 'transmissionType',
    bodyType: 'bodyType',
    seats: 'seats',
    color: 'color',
    price: 'dailyRate',
    currencyType: 'currencyType',
    imageUrl: 'imageUrl',
};

const VIN_LENGTH = 17;

export function carFormFieldErrors(error: unknown): CarFormErrors {
    const result: CarFormErrors = {};
    for (const [field, message] of Object.entries(fieldErrorMap(error))) {
        const key = BACKEND_FIELD_TO_FORM[field];
        if (key) result[key] = message;
    }
    return result;
}

export function validateCarForm(formData: CarFormData): CarFormErrors {
    const errors: CarFormErrors = {};

    if (!formData.brand.trim()) errors.brand = 'Brand is required';
    if (!formData.model.trim()) errors.model = 'Model is required';
    if (!formData.licensePlate.trim()) errors.licensePlate = 'License plate is required';
    if (!formData.fuelType) errors.fuelType = 'Fuel type is required';
    if (!formData.transmissionType) errors.transmissionType = 'Transmission is required';
    if (formData.dailyRate <= 0) errors.dailyRate = 'Daily rate must be greater than 0';

    const vin = formData.vin.replace(/[^A-Z0-9]/gi, '');
    if (vin && vin.length !== VIN_LENGTH) {
        errors.vin = `VIN must be exactly ${VIN_LENGTH} characters (${vin.length} entered)`;
    }

    const imageUrl = formData.imageUrl.trim();
    if (imageUrl && !/^https?:\/\/.+$/.test(imageUrl)) {
        errors.imageUrl = 'Image URL must start with http:// or https://';
    }

    return errors;
}

export function useCarForm(initialData: CarFormData = defaultCarFormData) {
    const [formData, setFormData] = useState<CarFormData>(initialData);
    const [errors, setErrors] = useState<CarFormErrors>({});

    const updateField = useCallback((field: keyof CarFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors = validateCarForm(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        updateField,
        validateForm,
    };
}
