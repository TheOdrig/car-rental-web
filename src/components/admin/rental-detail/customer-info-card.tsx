'use client';

import Link from 'next/link';
import { User, Mail, Phone, ExternalLink, ShieldAlert, ShieldCheck, Car, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CopyButton, StatCard } from '@/components/admin';
import { formatCurrency } from '@/lib/utils/format';
import type { RentalCustomerInfo } from '@/types';

interface CustomerInfoCardProps {
    customer: RentalCustomerInfo;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
    const initials = `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
    const isVerified = customer.emailVerified && customer.phoneVerified;

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-emerald-500" />
                        Customer
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${customer.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Profile
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.avatarUrl} alt={`${customer.firstName} ${customer.lastName}`} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                            {customer.firstName} {customer.lastName}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {customer.id}
                            </span>
                            <CopyButton value={String(customer.id)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a
                            href={`mailto:${customer.email}`}
                            className="text-slate-700 dark:text-slate-300 hover:underline"
                        >
                            {customer.email}
                        </a>
                        <CopyButton value={customer.email} />
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <a
                                href={`tel:${customer.phone}`}
                                className="text-slate-700 dark:text-slate-300 hover:underline"
                            >
                                {customer.phone}
                            </a>
                            <CopyButton value={customer.phone} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {isVerified ? (
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Unverified
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <StatCard
                        label="Rentals"
                        value={customer.stats.totalRentals}
                        icon={Car}
                        className="p-2"
                    />
                    <StatCard
                        label="Spent"
                        value={formatCurrency(customer.stats.totalSpent, 'USD')}
                        icon={DollarSign}
                        className="p-2"
                    />
                    <StatCard
                        label="Damages"
                        value={customer.stats.damageCount}
                        icon={AlertTriangle}
                        className="p-2"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
