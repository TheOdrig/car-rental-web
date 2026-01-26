'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDamage } from '@/lib/hooks';
import type { DamageSeverity, DamageCategory } from '@/types';

const damageReportSchema = z.object({
    description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
    damageLocation: z.string().max(200, 'Location cannot exceed 200 characters').optional(),
    initialSeverity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'TOTAL_LOSS']).optional(),
    category: z.enum(['SCRATCH', 'DENT', 'GLASS_DAMAGE', 'TIRE_DAMAGE', 'INTERIOR_DAMAGE', 'MECHANICAL_DAMAGE']).optional(),
});

type DamageReportFormData = z.infer<typeof damageReportSchema>;

interface DamageReportFormProps {
    rentalId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const SEVERITY_OPTIONS: { value: DamageSeverity; label: string }[] = [
    { value: 'MINOR', label: 'Minor' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'MAJOR', label: 'Major' },
    { value: 'TOTAL_LOSS', label: 'Total Loss' },
];

const CATEGORY_OPTIONS: { value: DamageCategory; label: string }[] = [
    { value: 'SCRATCH', label: 'Scratch' },
    { value: 'DENT', label: 'Dent' },
    { value: 'GLASS_DAMAGE', label: 'Glass Damage' },
    { value: 'TIRE_DAMAGE', label: 'Tire Damage' },
    { value: 'INTERIOR_DAMAGE', label: 'Interior Damage' },
    { value: 'MECHANICAL_DAMAGE', label: 'Mechanical Damage' },
];

export function DamageReportForm({ rentalId, open, onOpenChange, onSuccess }: DamageReportFormProps) {
    const createDamage = useCreateDamage();
    const [severity, setSeverity] = useState<DamageSeverity | undefined>();
    const [category, setCategory] = useState<DamageCategory | undefined>();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DamageReportFormData>({
        resolver: zodResolver(damageReportSchema),
    });

    const onSubmit = async (data: DamageReportFormData) => {
        try {
            await createDamage.mutateAsync({
                rentalId,
                request: {
                    description: data.description,
                    damageLocation: data.damageLocation,
                    initialSeverity: severity,
                    category: category,
                },
            });
            reset();
            setSeverity(undefined);
            setCategory(undefined);
            onOpenChange(false);
            onSuccess?.();
        } catch {
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Report Damage</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new damage report for this rental. Provide as much detail as possible.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the damage in detail..."
                            {...register('description')}
                            className="min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="damageLocation" className="text-slate-700 dark:text-slate-300">Damage Location</Label>
                        <Input
                            id="damageLocation"
                            placeholder="e.g., Rear bumper, driver side"
                            {...register('damageLocation')}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        {errors.damageLocation && (
                            <p className="text-sm text-destructive">{errors.damageLocation.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Initial Severity</Label>
                            <Select
                                value={severity}
                                onValueChange={(value) => setSeverity(value as DamageSeverity)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SEVERITY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Category</Label>
                            <Select
                                value={category}
                                onValueChange={(value) => setCategory(value as DamageCategory)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createDamage.isPending} className="cursor-pointer">
                            {createDamage.isPending ? 'Creating...' : 'Create Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

