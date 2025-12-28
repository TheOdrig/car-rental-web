'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BasicInfoSection } from '@/components/admin/car-form/basic-info';
import { SpecificationsSection } from '@/components/admin/car-form/specifications';
import { PricingSection } from '@/components/admin/car-form/pricing';
import { useUpdateCar } from '@/lib/hooks/use-admin';
import { useCar } from '@/lib/hooks/use-cars';
import { useCarForm } from '@/lib/hooks';
import { toast } from 'sonner';

export default function EditCarPage() {
    const router = useRouter();
    const params = useParams();
    const carId = Number(params.id);

    const { data: carData, isLoading: isLoadingCar } = useCar(carId);
    const car = carData?.car;
    const updateCar = useUpdateCar();

    const {
        formData,
        setFormData,
        errors,
        updateField,
        validateForm,
    } = useCarForm();

    useEffect(() => {
        if (car) {
            setFormData({
                brand: car.brand || '',
                model: car.model || '',
                year: car.productionYear || new Date().getFullYear(),
                licensePlate: car.licensePlate || '',
                vin: car.vinNumber || '',
                fuelType: car.fuelType?.toLowerCase() || '',
                transmissionType: car.transmissionType?.toLowerCase() || '',
                bodyType: car.bodyType?.toLowerCase() || '',
                seats: car.seats || 5,
                color: car.color?.toLowerCase() || '',
                dailyRate: car.price || 0,
                weeklyRate: 0,
                depositAmount: car.damagePrice || 0,
            });
        }
    }, [car, setFormData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        updateCar.mutate({ id: carId, ...formData }, {
            onSuccess: () => {
                router.push('/admin/fleet');
            },
        });
    };

    if (isLoadingCar) {
        return <EditCarPageSkeleton />;
    }

    if (!car) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-xl font-semibold mb-2">Car not found</h2>
                <p className="text-muted-foreground mb-4">
                    The car you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button onClick={() => router.push('/admin/fleet')}>
                    Back to Fleet
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Fleet Management', href: '/admin/fleet' },
                    { label: `Edit ${car.brand} ${car.model}` },
                ]}
            />

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Car</h1>
                    <p className="text-muted-foreground">
                        Update details for {car.brand} {car.model}
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
                                    Update the vehicle identification details
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
                                    Update vehicle specifications
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
                                    Update rental rates and deposit
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
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={updateCar.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={updateCar.isPending} className="gap-2">
                        {updateCar.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function EditCarPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-5 w-64" />
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
