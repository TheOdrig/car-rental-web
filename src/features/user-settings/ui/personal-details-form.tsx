'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
    profileSchema,
    type ProfileFormData,
    getProfileDefaultValues,
} from '../lib/validations';

interface PersonalDetailsFormProps {
    initialData?: {
        firstName?: string;
        lastName?: string;
        phone?: string | null;
    };
    email?: string;
    emailVerified?: boolean;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    fieldErrors?: Partial<Record<keyof ProfileFormData, string>>;
    isSubmitting?: boolean;
    className?: string;
}

export function PersonalDetailsForm({
    initialData,
    email,
    emailVerified,
    onSubmit,
    fieldErrors,
    isSubmitting = false,
    className,
}: PersonalDetailsFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: getProfileDefaultValues(initialData),
    });

    const handleFormSubmit = async (data: ProfileFormData) => {
        await onSubmit(data);
    };

    return (
        <form noValidate
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
                                autoComplete="given-name"
                                {...register('firstName')}
                                aria-invalid={!!(errors.firstName || fieldErrors?.firstName)}
                                aria-describedby={(errors.firstName?.message ?? fieldErrors?.firstName) ? 'firstName-error' : undefined}
                                disabled={isSubmitting}
                            />
                            {(errors.firstName?.message ?? fieldErrors?.firstName) && (
                                <p id="firstName-error" className="text-sm text-destructive" role="alert">
                                    {errors.firstName?.message ?? fieldErrors?.firstName}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                autoComplete="family-name"
                                {...register('lastName')}
                                aria-invalid={!!(errors.lastName || fieldErrors?.lastName)}
                                aria-describedby={(errors.lastName?.message ?? fieldErrors?.lastName) ? 'lastName-error' : undefined}
                                disabled={isSubmitting}
                            />
                            {(errors.lastName?.message ?? fieldErrors?.lastName) && (
                                <p id="lastName-error" className="text-sm text-destructive" role="alert">
                                    {errors.lastName?.message ?? fieldErrors?.lastName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="email"
                                autoComplete="email"
                                type="email"
                                value={email || ''}
                                disabled
                                className="bg-muted"
                            />
                            {emailVerified === true && (
                                <Badge variant="success" className="gap-1">
                                    <CheckCircle className="h-3 w-3" aria-hidden="true" />
                                    Verified
                                </Badge>
                            )}
                            {emailVerified === false && (
                                <Badge variant="outline" className="gap-1 text-muted-foreground">
                                    <XCircle className="h-3 w-3" aria-hidden="true" />
                                    Not verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            {...register('phone')}
                            aria-invalid={!!(errors.phone || fieldErrors?.phone)}
                            aria-describedby={(errors.phone?.message ?? fieldErrors?.phone) ? 'phone-error phone-hint' : 'phone-hint'}
                            disabled={isSubmitting}
                        />
                        {(errors.phone?.message ?? fieldErrors?.phone) && (
                            <p id="phone-error" className="text-sm text-destructive" role="alert">
                                {errors.phone?.message ?? fieldErrors?.phone}
                            </p>
                        )}
                        <p id="phone-hint" className="text-xs text-muted-foreground">
                            Use international format with 7 to 15 digits (e.g., +1234567890)
                        </p>
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