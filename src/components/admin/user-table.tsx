'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Ban, UserCheck, Mail, CheckCircle2, User, Eye, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { safeFormatDate } from '@/lib/utils/format';
import { useUserList, useBanUser, useUnbanUser } from '@/lib/hooks/use-users';
import { BanUserDialog, UnbanUserDialog } from './user-actions-dialog';

type UserRole = 'ADMIN' | 'USER';
type UserStatus = 'ACTIVE' | 'BANNED';

interface UserTableProps {
    searchQuery?: string;
    roleFilter?: string;
    statusFilter?: string;
    isLoading?: boolean;
    className?: string;
}

interface UserForAction {
    id: number;
    name: string;
    status: UserStatus;
    banReason?: string;
}

const roleConfig: Record<UserRole, { label: string; dotColor: string; textColor: string }> = {
    ADMIN: {
        label: 'Admin',
        dotColor: 'bg-purple-500',
        textColor: 'text-purple-700 dark:text-purple-400',
    },
    USER: {
        label: 'Customer',
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
    },
};

const statusConfig: Record<UserStatus, { label: string; dotColor: string; textColor: string }> = {
    ACTIVE: {
        label: 'Active',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    BANNED: {
        label: 'Banned',
        dotColor: 'bg-red-500',
        textColor: 'text-red-700 dark:text-red-400',
    },
};

function getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '??';
}

function getDisplayName(firstName?: string, lastName?: string, email?: string): string {
    if (firstName || lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return email || 'Unknown User';
}

function getPrimaryRole(roles: string[]): UserRole {
    if (roles.includes('ADMIN')) return 'ADMIN';
    return 'USER';
}

function UserTableSkeleton({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const PAGE_SIZE = 20;

export const UserTable = memo(function UserTable({
    searchQuery = '',
    roleFilter = 'all',
    statusFilter = 'all',
    isLoading = false,
    className,
}: UserTableProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const { data, isLoading: isDataLoading, error } = useUserList({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        size: PAGE_SIZE,
    });

    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();

    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserForAction | null>(null);

    React.useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery, roleFilter, statusFilter]);

    const users = data?.content || [];
    const totalUsers = data?.totalElements || 0;
    const totalPages = data?.totalPages || 1;
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;


    const handleBanClick = (user: UserForAction) => {
        setSelectedUser(user);
        setBanDialogOpen(true);
    };

    const handleUnbanClick = (user: UserForAction) => {
        setSelectedUser(user);
        setUnbanDialogOpen(true);
    };

    const handleBanConfirm = (reason: string) => {
        if (selectedUser) {
            banMutation.mutate(
                { userId: selectedUser.id, reason },
                {
                    onSuccess: () => {
                        setBanDialogOpen(false);
                        setSelectedUser(null);
                    },
                }
            );
        }
    };

    const handleUnbanConfirm = () => {
        if (selectedUser) {
            unbanMutation.mutate(selectedUser.id, {
                onSuccess: () => {
                    setUnbanDialogOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    if (isLoading || isDataLoading) {
        return <UserTableSkeleton className={className} />;
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Failed to load users</h3>
                            <p className="text-sm text-muted-foreground mt-1">
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
            <Card className={cn("bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800", className)}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">User Accounts</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Showing {users.length} of {totalUsers} users
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <User className="h-8 w-8 opacity-50" />
                                                <p>No users found matching your criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const displayName = getDisplayName(user.firstName, user.lastName, user.email);
                                        const userRoles = (user as unknown as { roles?: string[]; role?: string | string[] }).roles || user.role;
                                        const roles = Array.isArray(userRoles)
                                            ? userRoles
                                            : (typeof userRoles === 'string' ? [userRoles] : []);
                                        const primaryRole = getPrimaryRole(roles);
                                        const status = (user.status?.toUpperCase() || 'ACTIVE') as UserStatus;

                                        return (
                                            <TableRow key={user.id} className="group">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={user.avatarUrl} alt={displayName} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                {getInitials(user.firstName, user.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <Link
                                                                href={`/admin/users/${user.id}`}
                                                                className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary hover:underline transition-colors"
                                                            >
                                                                {displayName}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                Joined {safeFormatDate(user.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-900 dark:text-slate-100">{user.email}</span>
                                                        {user.isEmailVerified && (
                                                            <CheckCircle2
                                                                className="h-4 w-4 text-green-500"
                                                                aria-label="Email verified"
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('w-2 h-2 rounded-full', roleConfig[primaryRole]?.dotColor)} />
                                                        <span className={cn('text-sm font-medium', roleConfig[primaryRole]?.textColor)}>
                                                            {roleConfig[primaryRole]?.label || primaryRole}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('w-2 h-2 rounded-full', statusConfig[status]?.dotColor)} />
                                                        <span className={cn('text-sm font-medium', statusConfig[status]?.textColor)}>
                                                            {statusConfig[status]?.label || status}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="Send email"
                                                            asChild
                                                        >
                                                            <a href={`mailto:${user.email}`}>
                                                                <Mail className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">More options</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/users/${user.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Profile
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {status === 'BANNED' ? (
                                                                    <DropdownMenuItem
                                                                        className="text-green-600"
                                                                        onClick={() => handleUnbanClick({
                                                                            id: user.id,
                                                                            name: displayName,
                                                                            status,
                                                                        })}
                                                                    >
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Unban User
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => handleBanClick({
                                                                            id: user.id,
                                                                            name: displayName,
                                                                            status,
                                                                        })}
                                                                    >
                                                                        <Ban className="mr-2 h-4 w-4" />
                                                                        Ban User
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage + 1} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="admin-nav"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={!hasPrevPage}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="admin-nav"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={!hasNextPage}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
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
