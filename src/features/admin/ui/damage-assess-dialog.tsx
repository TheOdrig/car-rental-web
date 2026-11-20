'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import { useAssessDamage, useReassessDamage } from '@/entities/damage';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import { getCurrencySymbol } from '@/shared/lib';
import type { DamageSeverity, DamageCategory } from '@/entities/damage';
import type { CurrencyType } from '@/shared/types';

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
    mode?: 'assess' | 'reassess';
    rentalCurrency?: CurrencyType;
    defaultValues?: {
        severity?: DamageSeverity;
        category?: DamageCategory;
        repairCostEstimate?: number;
        currency?: CurrencyType;
        insuranceCoverage?: boolean;
        insuranceDeductible?: number;
        assessmentNotes?: string;
    };
}

const CURRENCY_OPTIONS: CurrencyType[] = ['TRY', 'USD', 'EUR', 'GBP', 'JPY'];

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

export function DamageAssessDialog(props: DamageAssessDialogProps) {
    const { open, onOpenChange, mode = 'assess' } = props;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border ">
                <DialogHeader>
                    <DialogTitle className="text-foreground">{mode === 'reassess' ? 'Update Assessment' : 'Assess Damage'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {mode === 'reassess'
                            ? 'The current assessment, including its notes and deductible, is filled in below.'
                            : 'Evaluate the damage and provide repair cost estimate.'}
                    </DialogDescription>
                </DialogHeader>
                <AssessmentForm {...props} />
            </DialogContent>
        </Dialog>
    );
}

function AssessmentForm({
    damageId,
    onOpenChange,
    onSuccess,
    mode = 'assess',
    rentalCurrency,
    defaultValues,
}: DamageAssessDialogProps) {
    const assessMutation = useAssessDamage();
    const reassessMutation = useReassessDamage();
    const assessDamage = mode === 'reassess' ? reassessMutation : assessMutation;
    const [severity, setSeverity] = useState<DamageSeverity>(defaultValues?.severity || 'MODERATE');
    const [category, setCategory] = useState<DamageCategory>(defaultValues?.category || 'SCRATCH');
    const [insuranceCoverage, setInsuranceCoverage] = useState(defaultValues?.insuranceCoverage || false);
    const [chosenCurrency, setCurrency] = useState<CurrencyType | undefined>();
    const currency = chosenCurrency ?? rentalCurrency ?? defaultValues?.currency ?? DEFAULT_CURRENCY;
    const currencyOptions = rentalCurrency ? [rentalCurrency] : CURRENCY_OPTIONS;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            repairCostEstimate: defaultValues?.repairCostEstimate || 0,
            insuranceDeductible: defaultValues?.insuranceDeductible ?? 0,
            assessmentNotes: defaultValues?.assessmentNotes ?? '',
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
                    currency,
                    insuranceCoverage,
                    insuranceDeductible: data.insuranceDeductible,
                    assessmentNotes: data.assessmentNotes,
                },
            });
            onOpenChange(false);
            onSuccess?.();
        } catch {
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Severity *</Label>
                    <Select
                        value={severity}
                        onValueChange={(value) => setSeverity(value as DamageSeverity)}
                    >
                        <SelectTrigger aria-label="Severity" className="bg-background dark:bg-input/30 border-border text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border ">
                            {SEVERITY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-accent">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-muted-foreground">Category *</Label>
                    <Select
                        value={category}
                        onValueChange={(value) => setCategory(value as DamageCategory)}
                    >
                        <SelectTrigger aria-label="Damage category" className="bg-background dark:bg-input/30 border-border text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border ">
                            {CATEGORY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-accent">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-muted-foreground">Currency</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyType)}>
                    <SelectTrigger aria-label="Currency" className="bg-background dark:bg-input/30 border-border">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {currencyOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="repairCostEstimate" className="text-muted-foreground">Repair Cost Estimate ({currency}) *</Label>
                <Input
                    id="repairCostEstimate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-background dark:bg-input/30 border-border text-foreground placeholder:text-muted-foreground"
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
                    className="border-muted-foreground"
                />
                <Label htmlFor="insuranceCoverage" className="font-normal text-muted-foreground">
                    Covered by insurance
                </Label>
            </div>

            {insuranceCoverage && (
                <div className="space-y-2">
                    <Label htmlFor="insuranceDeductible" className="text-muted-foreground">Insurance Deductible ({getCurrencySymbol(currency)})</Label>
                    <Input
                        id="insuranceDeductible"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="bg-background dark:bg-input/30 border-border text-foreground placeholder:text-muted-foreground"
                        {...register('insuranceDeductible')}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="assessmentNotes" className="text-muted-foreground">Assessment Notes</Label>
                <Textarea
                    id="assessmentNotes"
                    placeholder="Additional notes about the assessment..."
                    className="bg-background dark:bg-input/30 border-border text-foreground placeholder:text-muted-foreground"
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
                    className="cursor-pointer border-border text-muted-foreground hover:bg-muted"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={assessDamage.isPending} className="cursor-pointer">
                    {assessDamage.isPending ? 'Saving...' : 'Save Assessment'}
                </Button>
            </DialogFooter>
        </form>
    );
}
