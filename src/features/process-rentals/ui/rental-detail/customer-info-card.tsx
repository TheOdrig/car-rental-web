'use client';

import Link from 'next/link';
import { User, Mail, Phone, ExternalLink, ShieldAlert, ShieldCheck, Car, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CopyButton } from '@/shared/ui/copy-button';
import { StatCard } from '@/shared/ui/stat-card';
import { formatAmountsByCurrency, personDisplayName, personInitials } from '@/shared/lib';
import type { RentalCustomerInfo } from '@/entities/rental';

interface CustomerInfoCardProps {
    customer: RentalCustomerInfo;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
    const name = personDisplayName(customer);
    const initials = personInitials(customer);
    const isVerified = customer.isEmailVerified && customer.isPhoneVerified;

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Customer
                    </CardTitle>
                    {customer.id > 0 && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/users/${customer.id}`}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Profile
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.avatarUrl} alt={name} />
                        <AvatarFallback className="bg-success-subtle text-success-subtle-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-foreground">
                            {name}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                ID: {customer.id}
                            </span>
                            <CopyButton value={String(customer.id)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                            href={`mailto:${customer.email}`}
                            className="text-muted-foreground hover:underline"
                        >
                            {customer.email}
                        </a>
                        <CopyButton value={customer.email} />
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a
                                href={`tel:${customer.phone}`}
                                className="text-muted-foreground hover:underline"
                            >
                                {customer.phone}
                            </a>
                            <CopyButton value={customer.phone} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                    {isVerified ? (
                        <Badge variant="success">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    ) : (
                        <Badge variant="warning">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Unverified
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <StatCard
                        label="Rentals"
                        value={customer.stats.totalRentals}
                        icon={Car}
                        className="p-2"
                    />
                    <StatCard
                        label="Damages"
                        value={customer.stats.damageCount}
                        icon={AlertTriangle}
                        className="p-2"
                    />
                    <StatCard
                        label="Net paid"
                        value={formatAmountsByCurrency(customer.stats.spentByCurrency).join(' + ') || '-'}
                        icon={DollarSign}
                        className="col-span-2 p-2"
                    />
                </div>
            </CardContent>
        </Card>
    );
}