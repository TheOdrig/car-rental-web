'use client';

import { User, Mail, Phone, Calendar, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CopyButton } from '@/shared/ui/copy-button';
import { formatDateTime, formatDate, personDisplayName, personInitials } from '@/shared/lib';
import type { CustomerDetailResponse, Role } from '@/entities/user';

interface CustomerDetailInfoCardProps {
    customer: CustomerDetailResponse;
}

const roleBadgeColors: Record<Role, string> = {
    ADMIN: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    USER: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
};

export function CustomerDetailInfoCard({ customer }: CustomerDetailInfoCardProps) {
    const name = personDisplayName(customer);
    const initials = personInitials(customer);
    const primaryRole = customer.roles[0] ?? 'USER';

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    Customer Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={customer.avatarUrl ?? undefined} alt={name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold [overflow-wrap:anywhere] text-slate-900 dark:text-slate-100">
                            {name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {customer.id}
                            </span>
                            <CopyButton value={String(customer.id)} />
                            <Badge className={roleBadgeColors[primaryRole]} variant="secondary">
                                <Shield className="h-3 w-3 mr-1" />
                                {primaryRole}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                            <a
                                href={`mailto:${customer.email}`}
                                className="break-all text-slate-900 dark:text-slate-100 hover:underline"
                            >
                                {customer.email}
                            </a>
                        </div>
                        <CopyButton value={customer.email} />
                        {customer.verification.emailVerified ? (
                            <Badge variant="success">Verified</Badge>
                        ) : (
                            <Badge variant="warning">Unverified</Badge>
                        )}
                    </div>

                    {customer.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <div className="flex-1">
                                <a
                                    href={`tel:${customer.phone}`}
                                    className="text-slate-900 dark:text-slate-100 hover:underline"
                                >
                                    {customer.phone}
                                </a>
                            </div>
                            <CopyButton value={customer.phone} />
                            {customer.verification.phoneVerified ? (
                                <Badge variant="success">Verified</Badge>
                            ) : (
                                <Badge variant="warning">Unverified</Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Registered</span>
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                {formatDate(customer.registrationDate)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Last Login</span>
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                {customer.lastLoginDate ? formatDateTime(customer.lastLoginDate) : 'Never logged in'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}