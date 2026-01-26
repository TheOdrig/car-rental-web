'use client';

import { useState, useCallback } from 'react';
import { CarFormData, defaultCarFormData } from '@/components/admin/car-form/types';

export function useCarForm(initialData: CarFormData = defaultCarFormData) {
    const [formData, setFormData] = useState<CarFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof CarFormData, string>>>({});

    const updateField = useCallback((field: keyof CarFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof CarFormData, string>> = {};

        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
        if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
        if (!formData.transmissionType) newErrors.transmissionType = 'Transmission is required';
        if (formData.dailyRate <= 0) newErrors.dailyRate = 'Daily rate must be greater than 0';

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

