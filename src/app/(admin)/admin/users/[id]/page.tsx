'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Ban, ShieldCheck, Mail, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
    DetailPageSkeleton,
    DetailPageError,
    CustomerDetailInfoCard,
    CustomerVerificationCard,
    CustomerStatisticsCard,
    CustomerStatusCard,
    CustomerRentalHistoryTable,
    CustomerNotesCard,
    BanCustomerDialog,
    UnbanCustomerDialog,
    ComingSoonPlaceholder,
} from '@/components/admin';
import { useCustomerDetail } from '@/lib/hooks/use-admin';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const customerId = parseInt(id, 10);

    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);

    const { data: customer, isLoading, isError, refetch } = useCustomerDetail(customerId);

    if (isNaN(customerId)) {
        router.push('/admin/users');
        return null;
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Users', href: '/admin/users' },
                        { label: 'Loading...' },
                    ]}
                />
                <DetailPageSkeleton />
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Users', href: '/admin/users' },
                        { label: `User #${customerId}` },
                    ]}
                />
                <DetailPageError
                    title="Customer Not Found"
                    message="The customer you are looking for does not exist or could not be loaded."
                    onRetry={() => refetch()}
                    backUrl="/admin/users"
                    backLabel="Back to Users"
                />
            </div>
        );
    }

    const customerName = `${customer.firstName} ${customer.lastName}`;
    const isBanned = customer.accountStatus.status === 'BANNED';
    const isActive = customer.accountStatus.status === 'ACTIVE';

    const handleBanSuccess = () => {
        setIsBanDialogOpen(false);
        void refetch();
    };

    const handleUnbanSuccess = () => {
        setIsUnbanDialogOpen(false);
        void refetch();
    };

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Users', href: '/admin/users' },
                    { label: customerName },
                ]}
            />


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {customerName}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer.email} • Member since {new Date(customer.registrationDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={`/admin/users/${customerId}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit Customer
                        </Link>
                    </Button>
                    {isActive && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsBanDialogOpen(true)}
                        >
                            <Ban className="h-4 w-4" />
                            Ban Customer
                        </Button>
                    )}
                    {isBanned && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => setIsUnbanDialogOpen(true)}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Unban Customer
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={`mailto:${customer.email}`}>
                            <Mail className="h-4 w-4" />
                            Send Email
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={`/admin/rentals?userId=${customerId}`}>
                            <History className="h-4 w-4" />
                            View All Rentals
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={`/admin/damages?userId=${customerId}`}>
                            <AlertTriangle className="h-4 w-4" />
                            View Damages
                        </Link>
                    </Button>
                </div>
            </div>


            <div className="grid gap-6 lg:grid-cols-2">
                <CustomerDetailInfoCard customer={customer} />
                <CustomerVerificationCard verification={customer.verification} customerId={customerId} />
            </div>


            <div className="grid gap-6 md:grid-cols-2">
                <CustomerStatusCard accountStatus={customer.accountStatus} />
                <CustomerStatisticsCard statistics={customer.statistics} />
            </div>


            <CustomerRentalHistoryTable customerId={customerId} />


            <ComingSoonPlaceholder
                title="Customer Damage History"
                description="A dedicated damage history view for customers will be available in a future update. Click 'View Damages' above to see all damage reports for this customer."
            />


            <ComingSoonPlaceholder
                title="Payment History"
                description="Payment history will be available in a future update. Track payment methods, transaction history, and refunds."
            />


            <CustomerNotesCard
                customerId={customerId}
                notes={customer.adminNotes}
                onNoteAdded={() => refetch()}
            />


            <BanCustomerDialog
                open={isBanDialogOpen}
                onOpenChange={setIsBanDialogOpen}
                customerId={customerId}
                customerName={customerName}
                statistics={customer.statistics}
                onSuccess={handleBanSuccess}
            />

            {isBanned && (
                <UnbanCustomerDialog
                    open={isUnbanDialogOpen}
                    onOpenChange={setIsUnbanDialogOpen}
                    customerId={customerId}
                    customerName={customerName}
                    accountStatus={customer.accountStatus}
                    onSuccess={handleUnbanSuccess}
                />
            )}
        </div>
    );
}
