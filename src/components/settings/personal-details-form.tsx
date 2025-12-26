'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/lib/utils/toast';

const personalDetailsSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    dateOfBirth: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
    initialData?: Partial<PersonalDetailsFormData>;
    email?: string;
    emailVerified?: boolean;
    onSubmit?: (data: PersonalDetailsFormData) => Promise<void>;
    className?: string;
}

export function PersonalDetailsForm({
    initialData,
    email,
    emailVerified = false,
    onSubmit,
    className,
}: PersonalDetailsFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<PersonalDetailsFormData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: initialData,
    });

    const handleFormSubmit = async (data: PersonalDetailsFormData) => {
        try {
            await onSubmit?.(data);
            showToast.success('Profile updated successfully');
        } catch {
            showToast.error('Failed to update profile');
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className={cn('space-y-6', className)}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                {...register('firstName')}
                                aria-invalid={!!errors.firstName}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                {...register('lastName')}
                                aria-invalid={!!errors.lastName}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="email"
                                type="email"
                                value={email || ''}
                                disabled
                                className="bg-muted"
                            />
                            {emailVerified && (
                                <Badge variant="outline" className="gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                {...register('phone')}
                                aria-invalid={!!errors.phone}
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                {...register('dateOfBirth')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input id="street" {...register('street')} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register('city')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State / Province</Label>
                            <Input id="state" {...register('state')} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                            <Input id="zipCode" {...register('zipCode')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...register('country')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
