'use client';

import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { CustomerVerification } from '@/entities/user';

interface CustomerVerificationCardProps {
    verification: CustomerVerification;
    customerId: number;
}

function VerificationRow({ label, verified }: { label: string; verified: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <Badge
                variant="outline"
                className={
                    verified
                        ? 'border-success-subtle-foreground/30 text-success-subtle-foreground'
                        : 'text-muted-foreground'
                }
            >
                {verified ? 'Verified' : 'Not verified'}
            </Badge>
        </div>
    );
}

export function CustomerVerificationCard({ verification }: CustomerVerificationCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    Verification Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <VerificationRow label="Email" verified={verification.emailVerified} />
                <VerificationRow label="Phone" verified={verification.phoneVerified} />
            </CardContent>
        </Card>
    );
}
