'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { CustomerVerification } from '@/entities/user';

interface CustomerVerificationCardProps {
    verification: CustomerVerification;
    customerId: number;
}

export function CustomerVerificationCard({ verification }: CustomerVerificationCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-violet-500" />
                    Verification Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        {verification.emailVerified ? (
                            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <ShieldAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        )}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Email</span>
                        <Badge
                            variant="outline"
                            className={verification.emailVerified
                                ? 'text-emerald-600 border-emerald-300 mt-1'
                                : 'text-red-600 border-red-300 mt-1'
                            }
                        >
                            {verification.emailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        {verification.phoneVerified ? (
                            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <ShieldAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        )}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Phone</span>
                        <Badge
                            variant="outline"
                            className={verification.phoneVerified
                                ? 'text-emerald-600 border-emerald-300 mt-1'
                                : 'text-red-600 border-red-300 mt-1'
                            }
                        >
                            {verification.phoneVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}