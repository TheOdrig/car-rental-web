'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import {
    BasicInfoSection,
    SpecificationsSection,
    PricingSection,
    useCreateCar,
    useCarForm,
    carFormFieldErrors,
} from '@/features/manage-fleet';
import { toast } from 'sonner';
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import { ROUTES } from '@/shared/config/routes';

export function AddCarContent() {
    const router = useRouter();
    const {
        formData,
        errors,
        setErrors,
        updateField,
        validateForm,
    } = useCarForm();
    const createCar = useCreateCar();
    const singleFlight = useSingleFlight();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        void singleFlight(async () => {
            try {
                await createCar.mutateAsync(formData);
            } catch (error) {
                setErrors(carFormFieldErrors(error));
                return;
            }
            router.push(ROUTES.admin.fleet);
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Fleet Management', href: ROUTES.admin.fleet },
                            { label: 'Add New Car' },
                        ]}
                    />
                }
                title="Add New Car"
                description="Add a new vehicle to your fleet"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="gap-2 bg-background border-border text-foreground hover:bg-accent hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back
                        </Button>
                    </>
                }
            />

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
                                    Set the daily rate and currency
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
                        disabled={createCar.isPending}
                        className="bg-background border-border text-foreground hover:bg-accent hover:text-foreground"
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
