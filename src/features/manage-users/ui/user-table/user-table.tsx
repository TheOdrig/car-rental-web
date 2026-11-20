'use client';

import { memo, useState } from 'react';
import { AlertCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { EmptyState } from '@/shared/ui/empty-state';
import { cn } from '@/shared/lib';
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import { useBanUser, useUnbanUser, useUserList } from '../../api/users-api';
import { BanUserDialog, UnbanUserDialog } from '../user-actions-dialog';
import type { UserForAction } from './user-display';
import { UserTablePagination } from './user-table-pagination';
import { UserTableRow } from './user-table-row';
import { UserTableSkeleton } from './user-table-skeleton';

interface UserTableProps {
    searchQuery?: string;
    roleFilter?: string;
    statusFilter?: string;
    isLoading?: boolean;
    className?: string;
}

const PAGE_SIZE = 20;

export const UserTable = memo(function UserTable({
    searchQuery = '',
    roleFilter = 'all',
    statusFilter = 'all',
    isLoading = false,
    className,
}: UserTableProps) {
    const filterKey = `${searchQuery}|${roleFilter}|${statusFilter}`;
    const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
    const currentPage = pageState.key === filterKey ? pageState.page : 0;
    const setCurrentPage = (page: number) => setPageState({ key: filterKey, page });
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserForAction | null>(null);

    const { data, isLoading: isDataLoading, error } = useUserList({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        size: PAGE_SIZE,
    });

    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();
    const singleFlight = useSingleFlight();

    const users = data?.content || [];
    const totalUsers = data?.totalElements || 0;
    const totalPages = data?.totalPages || 1;

    const closeDialogs = () => {
        setBanDialogOpen(false);
        setUnbanDialogOpen(false);
        setSelectedUser(null);
    };

    const handleBanConfirm = (reason: string) => {
        if (!selectedUser) return;

        void singleFlight(async () => {
            try {
                await banMutation.mutateAsync({ userId: selectedUser.id, reason, displayName: selectedUser.name });
            } catch {
                return;
            }
            closeDialogs();
        });
    };

    const handleUnbanConfirm = () => {
        if (!selectedUser) return;

        void singleFlight(async () => {
            try {
                await unbanMutation.mutateAsync({ userId: selectedUser.id, displayName: selectedUser.name });
            } catch {
                return;
            }
            closeDialogs();
        });
    };

    if (isLoading || isDataLoading) {
        return <UserTableSkeleton className={className} />;
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center gap-4 text-center" role="alert">
                        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Failed to load users</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {error instanceof Error ? error.message : 'An unexpected error occurred'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={cn('bg-card border-border', className)}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">User Accounts</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Showing {users.length} of {totalUsers} users
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="stack-table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyState size="compact" icon={User} title="No users found" description="No users match your criteria" />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <UserTableRow
                                            key={user.id}
                                            user={user}
                                            onBan={(target) => {
                                                setSelectedUser(target);
                                                setBanDialogOpen(true);
                                            }}
                                            onUnban={(target) => {
                                                setSelectedUser(target);
                                                setUnbanDialogOpen(true);
                                            }}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <UserTablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>

            <BanUserDialog
                open={banDialogOpen}
                onOpenChange={setBanDialogOpen}
                userName={selectedUser?.name || ''}
                onConfirm={handleBanConfirm}
                isLoading={banMutation.isPending}
            />

            <UnbanUserDialog
                open={unbanDialogOpen}
                onOpenChange={setUnbanDialogOpen}
                userName={selectedUser?.name || ''}
                banReason={selectedUser?.banReason}
                onConfirm={handleUnbanConfirm}
                isLoading={unbanMutation.isPending}
            />
        </>
    );
});
