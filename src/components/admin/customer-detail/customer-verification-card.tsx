'use client';

import { ShieldCheck, ShieldAlert, ShieldQuestion, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CustomerVerification, DocumentVerificationStatus } from '@/types';

interface CustomerVerificationCardProps {
    verification: CustomerVerification;
    customerId: number;
}

const docStatusColors: Record<DocumentVerificationStatus, string> = {
    YES: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    NO: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    PENDING: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
};

const docStatusLabels: Record<DocumentVerificationStatus, string> = {
    YES: 'Verified',
    NO: 'Not Verified',
    PENDING: 'Pending Review',
};

export function CustomerVerificationCard({ verification, customerId }: CustomerVerificationCardProps) {
    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-violet-500" />
                    Verification Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
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

                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        {verification.documentsVerified === 'YES' ? (
                            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        ) : verification.documentsVerified === 'PENDING' ? (
                            <ShieldQuestion className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        ) : (
                            <ShieldAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        )}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Documents</span>
                        <Badge
                            variant="outline"
                            className={`${docStatusColors[verification.documentsVerified]} mt-1`}
                        >
                            {docStatusLabels[verification.documentsVerified]}
                        </Badge>
                    </div>
                </div>

                {verification.documentTypes.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2">Uploaded Documents</span>
                        <div className="flex flex-wrap gap-2">
                            {verification.documentTypes.map((docType) => (
                                <Badge key={docType} variant="secondary" className="gap-1">
                                    <FileText className="h-3 w-3" />
                                    {docType}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
