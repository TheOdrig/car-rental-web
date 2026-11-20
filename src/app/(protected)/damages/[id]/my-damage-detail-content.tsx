'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, FileWarning } from 'lucide-react';
import { DocumentTitle } from '@/shared/ui/document-title';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrencyWithDecimals, formatDate, formatDateTime, formatRentalReference } from '@/shared/lib';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { ErrorMessage } from '@/shared/ui/error-message';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { DamageStatusBadge, DamageSeverityBadge, useMyDamageDetail, getDamageCategoryLabel } from '@/entities/damage';
import { VehicleLabel } from '@/entities/car';
import { DamageDisputeForm } from '@/features/manage-damages';

export function MyDamageDetailContent({ id }: { id: string }) {
    const damageId = parseInt(id, 10);
    const router = useRouter();

    const [showDisputeDialog, setShowDisputeDialog] = useState(false);

    const { data: damage, isLoading, isError, refetch } = useMyDamageDetail(
        Number.isInteger(damageId) ? damageId : null
    );

    if (isLoading) {
        return <DamageDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="container py-8">
                <ErrorMessage
                    title="Failed to load the damage report"
                    message="Please check your connection and try again."
                    onRetry={() => void refetch()}
                />
            </div>
        );
    }

    if (!damage) {
        return (
            <div className="container py-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
                    <DocumentTitle title="Damage report not found" />
                    <h1 className="text-lg font-semibold">Damage report not found</h1>
                    <p className="text-muted-foreground mt-1">
                        This damage report does not exist or it belongs to another account.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const canDispute = damage.status === 'CHARGED';
    const hasDispute = Boolean(
        damage.disputeReason ||
            damage.disputeComments ||
            damage.disputedAt ||
            damage.resolutionNotes ||
            damage.resolvedAt ||
            damage.refundAmount !== undefined
    );
    const damageCurrency = damage.currency ?? 'USD';
    const resolved = Boolean(damage.resolvedAt);

    return (
        <ErrorBoundary>
            <div className="container py-8">
                <Breadcrumb
                    className="mb-4"
                    items={[
                        { label: 'My Damages', href: '/damages' },
                        { label: `Damage report for ${formatRentalReference(damage.rentalId)}` },
                    ]}
                />
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                            <h1 className="text-2xl font-bold">Damage Report</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Reported on {formatDate(damage.reportedAt)}
                        </p>
                    </div>
                    {canDispute && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDisputeDialog(true)}
                        >
                            Dispute Charge
                        </Button>
                    )}
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
                                    <p className="font-medium">{damage.damageLocation || 'Not specified'}</p>
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
                            <CardTitle>Rental Details</CardTitle>
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
                                    <p className="text-sm text-muted-foreground">Rental</p>
                                    <p className="font-medium">
                                        <Link href={`/rentals/${damage.rentalId}`} className="text-primary hover:underline">
                                            {formatRentalReference(damage.rentalId)}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {damage.repairCostEstimate !== undefined && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Cost Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Repair Cost</p>
                                        <p className="text-xl font-bold">{formatCurrencyWithDecimals(damage.repairCostEstimate ?? 0, damage.currency ?? 'USD')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Your Liability</p>
                                        <p className="text-xl font-bold text-destructive">
                                            {formatCurrencyWithDecimals(damage.customerLiability ?? 0, damage.currency ?? 'USD')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance Coverage</p>
                                        <p className="font-medium">{damage.insuranceCoverage ? 'Yes' : 'No'}</p>
                                    </div>
                                    {damage.assessedAt && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Assessed On</p>
                                            <p className="font-medium">{formatDate(damage.assessedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {hasDispute && (
                        <Card className="md:col-span-2" data-testid="dispute-outcome">
                            <CardHeader>
                                <CardTitle>{resolved ? 'How your dispute ended' : 'Your dispute'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 [&>*]:min-w-0">
                                    {damage.disputedAt && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Disputed on</p>
                                            <p className="font-medium">{formatDateTime(damage.disputedAt)}</p>
                                        </div>
                                    )}
                                    {damage.originalLiability !== undefined && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Original liability</p>
                                            <p className="font-medium">{formatCurrencyWithDecimals(damage.originalLiability, damageCurrency)}</p>
                                        </div>
                                    )}
                                    {resolved && damage.customerLiability !== undefined && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Final liability</p>
                                            <p className="font-medium">{formatCurrencyWithDecimals(damage.customerLiability, damageCurrency)}</p>
                                        </div>
                                    )}
                                    {damage.refundAmount !== undefined && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Refunded to you</p>
                                            <p className="font-medium">{formatCurrencyWithDecimals(damage.refundAmount, damageCurrency)}</p>
                                        </div>
                                    )}
                                    {damage.resolvedAt && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Resolved on</p>
                                            <p className="font-medium">{formatDateTime(damage.resolvedAt)}</p>
                                        </div>
                                    )}
                                </div>
                                {damage.disputeReason && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Your reason</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.disputeReason}</p>
                                    </div>
                                )}
                                {damage.disputeComments && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Your comments</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.disputeComments}</p>
                                    </div>
                                )}
                                {damage.resolutionNotes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notes from our team</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{damage.resolutionNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {damage.photos && damage.photos.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {damage.photos.map((photo) => (
                                        <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden">
                                            <DynamicImage
                                                src={photo.secureUrl}
                                                alt={photo.fileName}
                                                fill
                                                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DamageDisputeForm
                    damageId={damage.id}
                    open={showDisputeDialog}
                    onOpenChange={setShowDisputeDialog}
                    onSuccess={() => refetch()}
                />
            </div>
        </ErrorBoundary>
    );
}

function DamageDetailSkeleton() {
    return (
        <div className="container py-8">
            <div className="mb-6 flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}