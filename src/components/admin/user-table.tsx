'use client';

import React, { memo } from 'react';
import { MoreHorizontal, Edit, Shield, Ban, UserCheck, Mail, CheckCircle2, User } from 'lucide-react';
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

type UserRole = 'admin' | 'customer' | 'support';
type UserStatus = 'active' | 'pending' | 'banned';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    isEmailVerified: boolean;
    registeredAt: string;
    lastLoginAt?: string;
}

interface UserTableProps {
    searchQuery?: string;
    roleFilter?: string;
    statusFilter?: string;
    isLoading?: boolean;
    className?: string;
}

const mockUsers: UserData[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'customer',
        status: 'active',
        isEmailVerified: true,
        registeredAt: '2024-01-15',
        lastLoginAt: '2024-12-25',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        registeredAt: '2023-06-20',
        lastLoginAt: '2024-12-26',
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        role: 'customer',
        status: 'pending',
        isEmailVerified: false,
        registeredAt: '2024-12-20',
    },
    {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        role: 'support',
        status: 'active',
        isEmailVerified: true,
        registeredAt: '2024-03-10',
        lastLoginAt: '2024-12-24',
    },
    {
        id: 5,
        name: 'Charlie Davis',
        email: 'charlie.d@example.com',
        role: 'customer',
        status: 'banned',
        isEmailVerified: true,
        registeredAt: '2023-11-05',
    },
];

const roleConfig: Record<UserRole, { label: string; className: string }> = {
    admin: {
        label: 'Admin',
        className: 'bg-purple-500 hover:bg-purple-600 text-white',
    },
    customer: {
        label: 'Customer',
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    support: {
        label: 'Support',
        className: 'bg-teal-500 hover:bg-teal-600 text-white',
    },
};

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
    active: {
        label: 'Active',
        className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    pending: {
        label: 'Pending',
        className: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20',
    },
    banned: {
        label: 'Banned',
        className: 'bg-red-500 hover:bg-red-600 text-white',
    },
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export const UserTable = memo(function UserTable({
    searchQuery = '',
    roleFilter = 'all',
    statusFilter = 'all',
    isLoading = false,
    className,
}: UserTableProps) {
    const filteredUsers = mockUsers.filter((user) => {
        const matchesSearch =
            searchQuery === '' ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
            roleFilter === 'all' || user.role === roleFilter;

        const matchesStatus =
            statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (isLoading) {
        return <UserTableSkeleton className={className} />;
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">User Accounts</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length} of {mockUsers.length} users
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
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <User className="h-8 w-8 opacity-50" />
                                            <p>No users found matching your criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Joined {formatDate(user.registeredAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{user.email}</span>
                                                {user.isEmailVerified && (
                                                    <CheckCircle2
                                                        className="h-4 w-4 text-green-500"
                                                        aria-label="Email verified"
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(roleConfig[user.role].className)}>
                                                {roleConfig[user.role].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(statusConfig[user.status].className)}>
                                                {statusConfig[user.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    aria-label={`Edit ${user.name}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            aria-label={`More actions for ${user.name}`}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Change Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.status === 'banned' ? (
                                                            <DropdownMenuItem className="text-green-600">
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Unban User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem className="text-destructive">
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Ban User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing 1-{filteredUsers.length} of {mockUsers.length} results
                    </p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

function UserTableSkeleton({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export { UserTableSkeleton };
