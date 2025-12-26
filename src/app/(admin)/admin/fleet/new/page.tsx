'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BasicInfoSection } from '@/components/admin/car-form/basic-info';
import { SpecificationsSection } from '@/components/admin/car-form/specifications';
import { PricingSection } from '@/components/admin/car-form/pricing';
import { ImagesSection } from '@/components/admin/car-form/images';
import { CarFormData, defaultCarFormData } from '@/components/admin/car-form/types';
import { useCreateCar } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';

interface ImageFile {
    id: string;
    file?: File;
    url: string;
    name: string;
    isExisting?: boolean;
}

export default function AddCarPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<CarFormData>(defaultCarFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof CarFormData, string>>>({});
    const [images, setImages] = useState<ImageFile[]>([]);

    const createCar = useCreateCar();

    const updateField = (field: keyof CarFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CarFormData, string>> = {};

        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
        if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
        if (!formData.transmissionType) newErrors.transmissionType = 'Transmission is required';
        if (formData.dailyRate <= 0) newErrors.dailyRate = 'Daily rate must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        createCar.mutate(formData, {
            onSuccess: () => {
                router.push('/admin/fleet');
            },
        });
    };

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet Management', href: '/admin/fleet' },
                    { label: 'Add New Car' },
                ]}
            />

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Car</h1>
                    <p className="text-muted-foreground">
                        Add a new vehicle to your fleet
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Enter the vehicle identification details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BasicInfoSection
                                    data={formData}
                                    errors={errors}
                                    onUpdate={updateField}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Specifications</CardTitle>
                                <CardDescription>
                                    Configure vehicle specifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SpecificationsSection
                                    data={formData}
                                    errors={errors}
                                    onUpdate={updateField}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>
                                    Set rental rates and deposit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PricingSection
                                    data={formData}
                                    errors={errors}
                                    onUpdate={updateField}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Images</CardTitle>
                                <CardDescription>
                                    Upload photos of the vehicle
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImagesSection
                                    images={images}
                                    onImagesChange={setImages}
                                    maxImages={10}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={createCar.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createCar.isPending} className="gap-2">
                        {createCar.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Add Car
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
