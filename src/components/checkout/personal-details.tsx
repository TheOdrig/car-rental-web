'use client';

import { Mail, Phone } from 'lucide-react';
import { Control, FieldErrors, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CheckoutFormSchema } from '@/lib/validations/checkout';

interface PersonalDetailsProps {
    control: Control<CheckoutFormSchema>;
    errors: FieldErrors<CheckoutFormSchema>;
    isLoggedIn: boolean;
}

export function PersonalDetails({
    control,
    errors,
    isLoggedIn,
}: PersonalDetailsProps) {
    return (
        <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    1
                </span>
                <h2 className="text-xl font-bold text-foreground">Personal Details</h2>
                {isLoggedIn && (
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Auto-filled from profile
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                    </Label>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="firstName"
                                placeholder="e.g. Sarah"
                                className={cn(
                                    'h-12',
                                    errors.firstName && 'border-destructive focus-visible:ring-destructive'
                                )}
                            />
                        )}
                    />
                    {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                    </Label>
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="lastName"
                                placeholder="e.g. Connor"
                                className={cn(
                                    'h-12',
                                    errors.lastName && 'border-destructive focus-visible:ring-destructive'
                                )}
                            />
                        )}
                    />
                    {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                    </Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                            <Mail className="h-5 w-5" />
                        </span>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="email"
                                    type="email"
                                    placeholder="sarah@example.com"
                                    className={cn(
                                        'h-12 pl-10',
                                        errors.email && 'border-destructive focus-visible:ring-destructive'
                                    )}
                                />
                            )}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                    </Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                            <Phone className="h-5 w-5" />
                        </span>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className={cn(
                                        'h-12 pl-10',
                                        errors.phone && 'border-destructive focus-visible:ring-destructive'
                                    )}
                                />
                            )}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
