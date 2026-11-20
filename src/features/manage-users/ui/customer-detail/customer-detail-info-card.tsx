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
    ADMIN: 'text-danger-subtle-foreground bg-danger-subtle',
    USER: 'text-info-subtle-foreground bg-info-subtle',
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
                        <AvatarFallback className="bg-success-subtle text-success-subtle-foreground text-xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold [overflow-wrap:anywhere] text-foreground">
                            {name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
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

                <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                            <a
                                href={`mailto:${customer.email}`}
                                className="break-all text-foreground hover:underline"
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
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                                <a
                                    href={`tel:${customer.phone}`}
                                    className="text-foreground hover:underline"
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

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="text-xs text-muted-foreground block">Registered</span>
                            <span className="text-sm text-foreground">
                                {formatDate(customer.registrationDate)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="text-xs text-muted-foreground block">Last Login</span>
                            <span className="text-sm text-foreground">
                                {customer.lastLoginDate ? formatDateTime(customer.lastLoginDate) : 'Never logged in'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}