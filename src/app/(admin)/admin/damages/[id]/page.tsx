'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DamageStatusBadge,
    DamageSeverityBadge,
    DamagePhotoUpload,
    DamageAssessDialog,
    DamageResolveDialog,
} from '@/components/admin';
import { useDamageDetail, useInvalidateDamages } from '@/lib/hooks';
import { getDamageCategoryLabel } from '@/types';

interface DamageDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function DamageDetailPage({ params }: DamageDetailPageProps) {
    const { id } = use(params);
    const damageId = parseInt(id, 10);
    const router = useRouter();
    const invalidate = useInvalidateDamages();

    const [showAssessDialog, setShowAssessDialog] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);

    const { data: damage, isLoading, refetch } = useDamageDetail(damageId);

    if (isLoading) {
        return <DamageDetailSkeleton />;
    }

    if (!damage) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold">Damage report not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const canAssess = damage.status === 'REPORTED' || damage.status === 'UNDER_ASSESSMENT';
    const canResolve = damage.status === 'DISPUTED';

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Damage Reports', href: '/admin/damages' },
                    { label: `#${damage.id}` },
                ]}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Damage Report #{damage.id}</h1>
                        <p className="text-sm text-muted-foreground">
                            Reported on {new Date(damage.reportedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canAssess && (
                        <Button onClick={() => setShowAssessDialog(true)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Assess Damage
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
                        <CardTitle>Rental & Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle</p>
                                <p className="font-medium">{damage.carLicensePlate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium">{damage.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rental ID</p>
                                <p className="font-medium">#{damage.rentalId}</p>
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
                                    <p className="text-xl font-bold">${damage.repairCostEstimate?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer Liability</p>
                                    <p className="text-xl font-bold">${damage.customerLiability?.toFixed(2) || '0.00'}</p>
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
                defaultValues={{
                    severity: damage.severity,
                    category: damage.category,
                    repairCostEstimate: damage.repairCostEstimate,
                    insuranceCoverage: damage.insuranceCoverage,
                }}
            />

            <DamageResolveDialog
                damageId={damage.id}
                open={showResolveDialog}
                onOpenChange={setShowResolveDialog}
                onSuccess={() => refetch()}
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
        <div className="space-y-6">
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
