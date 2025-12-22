'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Car,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
} from 'lucide-react';


interface AdminSidebarProps {
    username: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        label: 'Fleet Status',
        href: '/admin/fleet',
        icon: <Car className="h-5 w-5" />,
    },
    {
        label: 'Rentals',
        href: '/admin/rentals',
        icon: <ClipboardList className="h-5 w-5" />,
    },
];


export function AdminSidebar({ username }: AdminSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'flex flex-col border-r bg-card transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!collapsed && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            A
                        </div>
                        <span className="font-semibold">Admin Panel</span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(collapsed && 'mx-auto')}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                collapsed && 'justify-center px-2'
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            {item.icon}
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-2">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2',
                        collapsed && 'justify-center px-2'
                    )}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">{username}</p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
                        </div>
                    )}
                </div>

                <Link
                    href="/"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-1',
                        collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? 'Exit Admin' : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>Exit Admin</span>}
                </Link>
            </div>
        </aside>
    );
}
