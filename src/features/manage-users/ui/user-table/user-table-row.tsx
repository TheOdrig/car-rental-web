'use client';

import Link from 'next/link';
import { Ban, CheckCircle2, CircleAlert, Eye, Mail, MoreHorizontal, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shared/ui/table';
import { cn, formatDate, formatDateTime } from '@/shared/lib';
import type { User } from '../../model/types';
import {
    ROLE_CONFIG,
    STATUS_CONFIG,
    getDisplayName,
    getInitials,
    getPrimaryRole,
    NEVER_LOGGED_IN_LABEL,
    resolveRoles,
    resolveStatus,
    type UserForAction,
} from './user-display';
import { ROUTES } from '@/shared/config/routes';

interface UserTableRowProps {
    user: User;
    onBan: (user: UserForAction) => void;
    onUnban: (user: UserForAction) => void;
}

export function UserTableRow({ user, onBan, onUnban }: UserTableRowProps) {
    const displayName = getDisplayName(user.firstName, user.lastName, user.email);
    const primaryRole = getPrimaryRole(resolveRoles(user));
    const status = resolveStatus(user);
    const role = ROLE_CONFIG[primaryRole];
    const statusConfig = STATUS_CONFIG[status];
    const target: UserForAction = { id: user.id, name: displayName, status };

    return (
        <TableRow className="group">
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <Link
                            href={ROUTES.admin.user(user.id)}
                            className="block max-w-[14rem] truncate font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                        >
                            {displayName}
                        </Link>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell data-label="Email">
                <div className="flex items-center gap-2">
                    <span className="max-w-[16rem] truncate text-sm text-foreground">
                        {user.email}
                    </span>
                    {user.isEmailVerified ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success-subtle-foreground" aria-label="Email verified" />
                    ) : (
                        <CircleAlert className="h-4 w-4 shrink-0 text-warning-subtle-foreground" aria-label="Email not verified" />
                    )}
                </div>
            </TableCell>
            <TableCell data-label="Role">
                <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', role?.dotColor)} aria-hidden="true" />
                    <span className={cn('text-sm font-medium', role?.textColor)}>{role?.label || primaryRole}</span>
                </div>
            </TableCell>
            <TableCell data-label="Status">
                <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', statusConfig?.dotColor)} aria-hidden="true" />
                    <span className={cn('text-sm font-medium', statusConfig?.textColor)}>
                        {statusConfig?.label || status}
                    </span>
                </div>
            </TableCell>
            <TableCell data-label="Last login" className="text-sm text-muted-foreground" data-testid="user-last-login">
                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : NEVER_LOGGED_IN_LABEL}
            </TableCell>
            <TableCell data-wide className="text-right">
                <div className="flex items-center justify-end gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                    <Button variant="ghost" size="icon" className="h-11 w-11 md:h-8 md:w-8" asChild>
                        <a href={`mailto:${user.email}`} aria-label={`Send email to ${displayName}`}>
                            <Mail className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 md:h-8 md:w-8">
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">More options for {displayName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={ROUTES.admin.user(user.id)}>
                                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                    View Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status === 'BANNED' ? (
                                <DropdownMenuItem className="text-success-subtle-foreground" onClick={() => onUnban(target)}>
                                    <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Unban User
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="text-destructive" onClick={() => onBan(target)}>
                                    <Ban className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Ban User
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
}
