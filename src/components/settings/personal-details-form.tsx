'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    profileSchema,
    type ProfileFormData,
    getProfileDefaultValues,
} from '@/lib/validations/settings';

interface PersonalDetailsFormProps {
    initialData?: {
        firstName?: string;
        lastName?: string;
        phone?: string | null;
    };
    email?: string;
    emailVerified?: boolean;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    isSubmitting?: boolean;
    className?: string;
}

export function PersonalDetailsForm({
    initialData,
    email,
    emailVerified = false,
    onSubmit,
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                            aria-invalid={!!errors.phone}
                            disabled={isSubmitting}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">
                                {errors.phone.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Use international format (e.g., +1234567890)
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
