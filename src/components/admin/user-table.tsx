'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Shield, Ban, UserCheck, Mail, CheckCircle2, User, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const roleConfig: Record<UserRole, { label: string; className: string }> = {
    ADMIN: {
        label: 'Admin',
        className: 'bg-purple-500 hover:bg-purple-600 text-white',
    },
    USER: {
        label: 'Customer',
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
};

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
    ACTIVE: {
        label: 'Active',
        className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    BANNED: {
        label: 'Banned',
        className: 'bg-red-500 hover:bg-red-600 text-white',
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

export const UserTable = memo(function UserTable({
    searchQuery = '',
    roleFilter = 'all',
    statusFilter = 'all',
    isLoading = false,
    className,
}: UserTableProps) {
    const { data, isLoading: isDataLoading, error } = useUserList({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
    });

    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();

    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserForAction | null>(null);

    const users = data?.content || [];
    const totalUsers = data?.totalElements || 0;

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
            <Card className={className}>
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
                                        const roles = Array.isArray(user.role)
                                            ? user.role
                                            : (typeof user.role === 'string' ? [user.role] : []);
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
                                                                className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
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
                                                        <span className="text-sm text-foreground">{user.email}</span>
                                                        {user.isEmailVerified && (
                                                            <CheckCircle2
                                                                className="h-4 w-4 text-green-500"
                                                                aria-label="Email verified"
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(roleConfig[primaryRole]?.className)}>
                                                        {roleConfig[primaryRole]?.label || primaryRole}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(statusConfig[status]?.className)}>
                                                        {statusConfig[status]?.label || status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="Send email"
                                                        >
                                                            <Mail className="h-4 w-4" />
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
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    Change Role
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
