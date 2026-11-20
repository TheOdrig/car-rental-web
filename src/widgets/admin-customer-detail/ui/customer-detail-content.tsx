'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, ShieldCheck, Mail, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Breadcrumb } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/page-header';
import { DetailPageLoadingState, DetailPageErrorState, CustomerDamageHistory } from '@/features/admin';
import {
    CustomerDetailInfoCard,
    CustomerVerificationCard,
    CustomerStatisticsCard,
    CustomerStatusCard,
    CustomerRentalHistoryTable,
    CustomerNotesCard,
    BanCustomerDialog,
    UnbanCustomerDialog,
    useCustomerDetail,
} from '@/features/manage-users';
import { isActiveAccount, isBannedAccount } from '@/entities/user';
import { formatDate, personDisplayName } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useNumericParam } from '@/shared/lib/use-numeric-param';

const SECTION = { label: 'Users', href: ROUTES.admin.users, backLabel: 'Back to Users' };

export function CustomerDetailContent({ id }: { id: string }) {
    const customerId = useNumericParam(id);

    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);

    const { data: customer, isLoading, isError, refetch } = useCustomerDetail(customerId);

    if (isLoading) return <DetailPageLoadingState section={SECTION} />;

    if (isError || !customer) return (
        <DetailPageErrorState
            section={SECTION}
            current={`User #${customerId}`}
            title="Customer Not Found"
            message="The customer you are looking for does not exist or could not be loaded."
            onRetry={() => refetch()}
        />
    );

    const customerName = personDisplayName(customer);
    const isBanned = isBannedAccount(customer.accountStatus);
    const isActive = isActiveAccount(customer.accountStatus);

    const handleBanSuccess = () => {
        setIsBanDialogOpen(false);
        void refetch();
    };

    const handleUnbanSuccess = () => {
        setIsUnbanDialogOpen(false);
        void refetch();
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                surface
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Users', href: ROUTES.admin.users },
                            { label: customerName },
                        ]}
                    />
                }
                title={customerName}
                description={
                    <>
                        {customer.email} • Member since {customer.registrationDate ? formatDate(customer.registrationDate) : 'N/A'}
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.users}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>

                        {isActive && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsBanDialogOpen(true)}
                            >
                                <Ban className="h-4 w-4" />
                                Ban Customer
                            </Button>
                        )}
                        {isBanned && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsUnbanDialogOpen(true)}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Unban Customer
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${customer.email}`}>
                                <Mail className="h-4 w-4" />
                                Send Email
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.rentalsOfUser(customerId)}>
                                <History className="h-4 w-4" />
                                View All Rentals
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.admin.damagesOfUser(customerId)}>
                                <AlertTriangle className="h-4 w-4" />
                                View Damages
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
                <CustomerDetailInfoCard customer={customer} />
                <CustomerVerificationCard verification={customer.verification} customerId={customerId} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*]:min-w-0">
                <CustomerStatusCard accountStatus={customer.accountStatus} />
                <CustomerStatisticsCard statistics={customer.statistics} />
            </div>

            <CustomerRentalHistoryTable customerId={customerId} />

            <CustomerDamageHistory userId={customerId} maxItems={5} />

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