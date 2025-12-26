'use client';

import React, { useState } from 'react';
import { RefreshCw, Download, UserPlus, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { UserStatsCards } from '@/components/admin/user-stats';
import { UserTable } from '@/components/admin/user-table';
import { toast } from 'sonner';

type UserRole = 'all' | 'admin' | 'customer' | 'support';
type UserStatus = 'all' | 'active' | 'pending' | 'banned';

export default function UserManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole>('all');
    const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('User data refreshed');
        }, 500);
    };

    const handleExport = () => {
        toast.info('Export feature coming soon');
    };

    const handleAddUser = () => {
        toast.info('Add user feature coming soon');
    };

    const lastUpdated = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'User Management' },
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <p className="text-sm">Manage customer and admin accounts</p>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full border border-dashed">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            Updated {lastUpdated}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAddUser}
                        className="gap-2"
                    >
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                        Add User
                    </Button>
                </div>
            </div>

            <UserStatsCards
                data={{
                    totalUsers: 1247,
                    activeUsers: 1089,
                    pendingUsers: 43,
                    bannedUsers: 12,
                }}
                isLoading={isLoading}
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole)}>
                        <SelectTrigger className="w-[140px]" aria-label="Filter by role">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus)}>
                        <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <UserTable
                searchQuery={searchQuery}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                isLoading={isLoading}
            />
        </div>
    );
}
