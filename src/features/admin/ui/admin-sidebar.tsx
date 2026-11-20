'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet';
import {
    LayoutDashboard,
    Car,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    User,
    Users,
    AlertTriangle,
    Bell,
    Clock,
    Menu,
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
        label: 'Fleet Management',
        href: '/admin/fleet',
        icon: <Car className="h-5 w-5" />,
    },
    {
        label: 'Customers',
        href: '/admin/users',
        icon: <Users className="h-5 w-5" />,
    },
    {
        label: 'Rental Management',
        href: '/admin/rentals',
        icon: <ClipboardList className="h-5 w-5" />,
    },
    {
        label: 'Damage Reports',
        href: '/admin/damages',
        icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
        label: 'Alerts',
        href: '/admin/alerts',
        icon: <Bell className="h-5 w-5" />,
    },
    {
        label: 'Late Returns',
        href: '/admin/late-returns',
        icon: <Clock className="h-5 w-5" />,
    },
];

interface NavLinksProps {
    pathname: string | null;
    collapsed?: boolean;
    label: string;
    onNavigate?: () => void;
}

function NavLinks({ pathname, collapsed = false, label, onNavigate }: NavLinksProps) {
    return (
        <nav className="flex-1 space-y-1 p-2" aria-label={label}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.label : undefined}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {item.icon}
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );
}

function AdminUser({ username, collapsed = false }: { username: string; collapsed?: boolean }) {
    return (
        <div className="border-t border-border p-2">
            <div
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    collapsed && 'justify-center px-2'
                )}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <User className="h-4 w-4" aria-hidden="true" />
                </div>
                {!collapsed && (
                    <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{username}</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function AdminMobileMenu({ username }: AdminSidebarProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open admin menu">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b border-border">
                    <SheetTitle>Admin Panel</SheetTitle>
                    <SheetDescription className="sr-only">Navigate between admin areas</SheetDescription>
                </SheetHeader>
                <NavLinks pathname={pathname} label="Admin mobile navigation" onNavigate={() => setMenuOpen(false)} />
                <AdminUser username={username} />
            </SheetContent>
        </Sheet>
    );
}

export function AdminSidebar({ username }: AdminSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const query = window.matchMedia('(max-width: 1279px)');
        const apply = () => setCollapsed(query.matches);
        apply();
        query.addEventListener('change', apply);
        return () => query.removeEventListener('change', apply);
    }, []);

    return (
        <>
            <aside
                className={cn(
                    'hidden md:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-300',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
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
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                    </Button>
                </div>

                <NavLinks pathname={pathname} collapsed={collapsed} label="Admin navigation" />
                <AdminUser username={username} collapsed={collapsed} />
            </aside>
        </>
    );
}
