'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Clock, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { UserStatsCards, UserTable, useUserStats, useInvalidateUsers } from '@/features/manage-users';
import { toast } from 'sonner';
import { ErrorMessage } from '@/shared/ui/error-message';
import { PageHeader } from '@/shared/ui/page-header';
import { formatTime } from '@/shared/lib';

type UserRole = 'all' | 'ADMIN' | 'USER';
type UserStatus = 'all' | 'ACTIVE' | 'BANNED';

export function UserManagementContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState(() => (searchParams?.get('search') ?? '').slice(0, 100));
    const [roleFilter, setRoleFilter] = useState<UserRole>('all');
    const [statusFilter, setStatusFilter] = useState<UserStatus>('all');

    const currentSearch = searchParams?.get('search') ?? '';

    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (trimmed === currentSearch) return;
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        if (trimmed) params.set('search', trimmed);
        else params.delete('search');
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, [searchQuery, currentSearch, searchParams, pathname, router]);

    const { data: stats, isLoading: isLoadingStats, isError: statsFailed, refetch: refetchStats } = useUserStats();
    const invalidateUsers = useInvalidateUsers();

    const handleRefresh = async () => {
        await invalidateUsers.all();
        toast.success('User data refreshed');
    };

    const lastUpdated = formatTime(new Date());

    const statsData = {
        totalUsers: stats?.totalUsers ?? 0,
        activeUsers: stats?.activeUsers ?? 0,
        bannedUsers: stats?.bannedUsers ?? 0,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: '/admin/dashboard' },
                            { label: 'User Management' },
                        ]}
                    />
                }
                title="User Management"
                description={
                    <>
                        <p className="text-sm">Manage customer and admin accounts</p>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium bg-card px-2 py-0.5 rounded-md border border-border">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            Updated {lastUpdated}
                        </span>
                    </>
                }
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoadingStats}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} aria-hidden="true" />
                            Refresh
                        </Button>
                    </>
                }
            />

            {statsFailed ? (
                <ErrorMessage
                    title="Failed to load user statistics"
                    message="The user statistics could not be loaded."
                    onRetry={() => void refetchStats()}
                />
            ) : (
                <UserStatsCards
                    data={statsData}
                    isLoading={isLoadingStats}
                />
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        aria-label="Search users"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole)}>
                        <SelectTrigger
                            className="w-[140px] bg-background border-border hover:bg-accent transition-colors cursor-pointer text-foreground"
                            aria-label="Filter by role"
                        >
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="USER">Customer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus)}>
                        <SelectTrigger
                            className="w-[140px] bg-background border-border hover:bg-accent transition-colors cursor-pointer text-foreground"
                            aria-label="Filter by status"
                        >
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="BANNED">Banned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <UserTable
                searchQuery={searchQuery}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                isLoading={isLoadingStats}
            />
        </div >
    );
}
