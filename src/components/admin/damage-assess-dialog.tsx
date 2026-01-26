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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAssessDamage } from '@/lib/hooks';
import type { DamageSeverity, DamageCategory } from '@/types';

const assessmentSchema = z.object({
    repairCostEstimate: z.coerce.number().positive('Repair cost must be greater than 0'),
    insuranceDeductible: z.coerce.number().min(0).optional().default(0),
    assessmentNotes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().default(''),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface DamageAssessDialogProps {
    damageId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    defaultValues?: {
        severity?: DamageSeverity;
        category?: DamageCategory;
        repairCostEstimate?: number;
        insuranceCoverage?: boolean;
    };
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

export function DamageAssessDialog({
    damageId,
    open,
    onOpenChange,
    onSuccess,
    defaultValues,
}: DamageAssessDialogProps) {
    const assessDamage = useAssessDamage();
    const [severity, setSeverity] = useState<DamageSeverity>(defaultValues?.severity || 'MODERATE');
    const [category, setCategory] = useState<DamageCategory>(defaultValues?.category || 'SCRATCH');
    const [insuranceCoverage, setInsuranceCoverage] = useState(defaultValues?.insuranceCoverage || false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            repairCostEstimate: defaultValues?.repairCostEstimate || 0,
            insuranceDeductible: 0,
            assessmentNotes: '',
        },
    });

    const onSubmit = async (data: AssessmentFormData) => {
        try {
            await assessDamage.mutateAsync({
                damageId,
                request: {
                    severity,
                    category,
                    repairCostEstimate: data.repairCostEstimate,
                    insuranceCoverage,
                    insuranceDeductible: data.insuranceDeductible,
                    assessmentNotes: data.assessmentNotes,
                },
            });
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch {
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Assess Damage</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Evaluate the damage and provide repair cost estimate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Severity *</Label>
                            <Select
                                value={severity}
                                onValueChange={(value) => setSeverity(value as DamageSeverity)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700">
                                    {SEVERITY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Category *</Label>
                            <Select
                                value={category}
                                onValueChange={(value) => setCategory(value as DamageCategory)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700">
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repairCostEstimate" className="text-slate-700 dark:text-slate-300">Repair Cost Estimate ($) *</Label>
                        <Input
                            id="repairCostEstimate"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                            {...register('repairCostEstimate')}
                        />
                        {errors.repairCostEstimate && (
                            <p className="text-sm text-destructive">{errors.repairCostEstimate.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="insuranceCoverage"
                            checked={insuranceCoverage}
                            onCheckedChange={(checked) => setInsuranceCoverage(checked === true)}
                            className="border-slate-400 dark:border-slate-500"
                        />
                        <Label htmlFor="insuranceCoverage" className="font-normal text-slate-700 dark:text-slate-300">
                            Covered by insurance
                        </Label>
                    </div>

                    {insuranceCoverage && (
                        <div className="space-y-2">
                            <Label htmlFor="insuranceDeductible" className="text-slate-700 dark:text-slate-300">Insurance Deductible ($)</Label>
                            <Input
                                id="insuranceDeductible"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                {...register('insuranceDeductible')}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="assessmentNotes" className="text-slate-700 dark:text-slate-300">Assessment Notes</Label>
                        <Textarea
                            id="assessmentNotes"
                            placeholder="Additional notes about the assessment..."
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                            {...register('assessmentNotes')}
                        />
                        {errors.assessmentNotes && (
                            <p className="text-sm text-destructive">{errors.assessmentNotes.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={assessDamage.isPending} className="cursor-pointer">
                            {assessDamage.isPending ? 'Saving...' : 'Save Assessment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

