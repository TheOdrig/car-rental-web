'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/shared';
import { DamageStatusBadge, DamageSeverityBadge } from '@/components/admin';
import { DamageDisputeForm } from '@/components/damages';
import { useDamageDetail } from '@/lib/hooks';
import { getDamageCategoryLabel } from '@/types';

interface DamageDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function MyDamageDetailPage({ params }: DamageDetailPageProps) {
    const { id } = use(params);
    const damageId = parseInt(id, 10);
    const router = useRouter();

    const [showDisputeDialog, setShowDisputeDialog] = useState(false);

    const { data: damage, isLoading, refetch } = useDamageDetail(damageId);

    if (isLoading) {
        return <DamageDetailSkeleton />;
    }

    if (!damage) {
        return (
            <div className="container py-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold">Damage report not found</h2>
                    <p className="text-muted-foreground mt-1">
                        This damage report may not exist or you may not have access to it.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const canDispute = damage.status === 'CHARGED';

    return (
        <ErrorBoundary>
            <div className="container py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                            <h1 className="text-2xl font-bold">Damage Report</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Reported on {new Date(damage.reportedAt).toLocaleDateString()}
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

                <div className="grid gap-6 md:grid-cols-2">
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
                                <p className="mt-1">{damage.description}</p>
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
                                    <p className="font-medium">{damage.carLicensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Rental ID</p>
                                    <p className="font-medium">#{damage.rentalId}</p>
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
                                        <p className="text-xl font-bold">${damage.repairCostEstimate?.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Your Liability</p>
                                        <p className="text-xl font-bold text-destructive">
                                            ${damage.customerLiability?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance Coverage</p>
                                        <p className="font-medium">{damage.insuranceCoverage ? 'Yes' : 'No'}</p>
                                    </div>
                                    {damage.assessedAt && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Assessed On</p>
                                            <p className="font-medium">{new Date(damage.assessedAt).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
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
                                            <img
                                                src={photo.secureUrl}
                                                alt={photo.fileName}
                                                className="w-full h-full object-cover"
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
