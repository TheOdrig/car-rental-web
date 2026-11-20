'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Camera, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { DocumentTitle } from '@/shared/ui/document-title';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrencyWithDecimals, formatDate, formatDateTime, formatRentalReference } from '@/shared/lib';
import {
    DamageStatusBadge, useDamageDetail, getDamageCategoryLabel, canAssessDamage, canReassessDamage, canResolveDamageDispute, canChargeDamage, hasDisputeActivity } from '@/entities/damage';
import { DamagePhotoUpload, DamageAssessDialog, DamageResolveDialog, DamageChargeDialog } from '@/features/admin';
import { DamageSeverityBadge } from '@/entities/damage';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import { useRental } from '@/entities/rental';
import { VehicleLabel } from '@/entities/car';
import type { CurrencyType } from '@/shared/types';

export function DamageDetailContent({ id }: { id: string }) {
    const damageId = parseInt(id, 10);
    const router = useRouter();

    const [showAssessDialog, setShowAssessDialog] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [showChargeDialog, setShowChargeDialog] = useState(false);

    const { data: damage, isLoading, refetch } = useDamageDetail(damageId);
    const rentalQuery = useRental(damage?.rentalId);

    if (isLoading) {
        return <DamageDetailSkeleton />;
    }

    if (!damage) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <DocumentTitle title="Damage report not found" />
                <h1 className="text-lg font-semibold">Damage report not found</h1>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const canAssess = canAssessDamage(damage);
    const canReassess = canReassessDamage(damage);
    const hasDispute = hasDisputeActivity(damage);
    const canResolve = canResolveDamageDispute(damage);
    const canCharge = canChargeDamage(damage);
    const chargeCurrency = damage.currency ?? DEFAULT_CURRENCY;

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Damage Reports', href: '/admin/damages' },
                    { label: `#${damage.id}` },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Damage Report #{damage.id}</h1>
                        <p className="text-sm text-muted-foreground">
                            Reported on {formatDate(damage.reportedAt)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {canAssess && (
                        <Button onClick={() => setShowAssessDialog(true)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Assess Damage
                        </Button>
                    )}
                    {canReassess && (
                        <Button variant="outline" onClick={() => setShowAssessDialog(true)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Update Assessment
                        </Button>
                    )}
                    {canCharge && (
                        <Button onClick={() => setShowChargeDialog(true)} className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            Charge customer
                        </Button>
                    )}
                    {canResolve && (
                        <Button onClick={() => setShowResolveDialog(true)} className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Resolve Dispute
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*]:min-w-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Damage Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <DamageStatusBadge status={damage.status} className="mt-1" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Severity</p>
                                <DamageSeverityBadge severity={damage.severity} className="mt-1" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-medium">{getDamageCategoryLabel(damage.category)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="break-words font-medium">{damage.damageLocation || 'Not specified'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rental & Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle</p>
                                <p className="font-medium">
                                    <VehicleLabel carSummary={damage.carSummary} licensePlate={damage.carLicensePlate} />
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="break-words font-medium">{damage.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rental</p>
                                <p className="font-medium">
                                    <Link href={`/admin/rentals/${damage.rentalId}`} className="text-primary hover:underline">
                                        {formatRentalReference(damage.rentalId)}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {damage.repairCostEstimate !== undefined && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Repair Cost</p>
                                    <p className="text-xl font-bold">{formatCurrencyWithDecimals(damage.repairCostEstimate ?? 0, damage.currency ?? DEFAULT_CURRENCY)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer Liability</p>
                                    <p className="text-xl font-bold">{formatCurrencyWithDecimals(damage.customerLiability ?? 0, damage.currency ?? DEFAULT_CURRENCY)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Insurance Coverage</p>
                                    <p className="font-medium">{damage.insuranceCoverage ? 'Yes' : 'No'}</p>
                                </div>
                                {damage.insuranceDeductible !== undefined && (
                                    <div data-testid="damage-deductible">
                                        <p className="text-sm text-muted-foreground">Insurance Deductible</p>
                                        <p className="font-medium">{formatCurrencyWithDecimals(damage.insuranceDeductible, damage.currency ?? DEFAULT_CURRENCY)}</p>
                                    </div>
                                )}
                                {damage.assessedAt && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assessed On</p>
                                        <p className="font-medium">{formatDate(damage.assessedAt)}</p>
                                    </div>
                                )}
                            </div>
                            {damage.assessmentNotes && (
                                <div data-testid="damage-assessment-notes">
                                    <p className="text-sm text-muted-foreground">Assessment Notes</p>
                                    <p className="whitespace-pre-wrap break-words font-medium [overflow-wrap:anywhere]">{damage.assessmentNotes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {hasDispute && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Dispute</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {damage.disputedAt && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Disputed On</p>
                                        <p className="font-medium">{formatDateTime(damage.disputedAt)}</p>
                                    </div>
                                )}
                                {damage.originalLiability !== undefined && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Original Liability</p>
                                        <p className="font-medium">{formatCurrencyWithDecimals(damage.originalLiability, damage.currency ?? DEFAULT_CURRENCY)}</p>
                                    </div>
                                )}
                                {damage.refundAmount !== undefined && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Refund</p>
                                        <p className="font-medium">{formatCurrencyWithDecimals(damage.refundAmount, damage.currency ?? DEFAULT_CURRENCY)}</p>
                                    </div>
                                )}
                                {damage.resolvedAt && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Resolved On</p>
                                        <p className="font-medium">{formatDateTime(damage.resolvedAt)}</p>
                                    </div>
                                )}
                            </div>
                            {damage.disputeReason && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer Reason</p>
                                    <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.disputeReason}</p>
                                </div>
                            )}
                            {damage.disputeComments && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer Comments</p>
                                    <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.disputeComments}</p>
                                </div>
                            )}
                            {damage.resolutionNotes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Resolution Notes</p>
                                    <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.resolutionNotes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Photos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DamagePhotoUpload
                            damageId={damage.id}
                            existingPhotos={damage.photos || []}
                            onUploadSuccess={() => refetch()}
                        />
                    </CardContent>
                </Card>
            </div>

            <DamageAssessDialog
                damageId={damage.id}
                open={showAssessDialog}
                onOpenChange={setShowAssessDialog}
                onSuccess={() => refetch()}
                mode={canReassess ? 'reassess' : 'assess'}
                rentalCurrency={rentalQuery.data?.currency as CurrencyType | undefined}
                defaultValues={{
                    severity: damage.severity,
                    category: damage.category,
                    repairCostEstimate: damage.repairCostEstimate,
                    currency: damage.currency,
                    insuranceCoverage: damage.insuranceCoverage,
                    insuranceDeductible: damage.insuranceDeductible,
                    assessmentNotes: damage.assessmentNotes,
                }}
            />

            <DamageChargeDialog
                damageId={damage.id}
                amount={damage.customerLiability ?? 0}
                currency={chargeCurrency}
                open={showChargeDialog}
                onOpenChange={setShowChargeDialog}
                onSuccess={() => refetch()}
            />

            <DamageResolveDialog
                damageId={damage.id}
                open={showResolveDialog}
                onOpenChange={setShowResolveDialog}
                onSuccess={() => refetch()}
                currency={chargeCurrency}
                defaultValues={{
                    repairCostEstimate: damage.repairCostEstimate,
                    customerLiability: damage.customerLiability,
                }}
            />
        </div>
    );
}

function DamageDetailSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <Skeleton className="h-6 w-64" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}