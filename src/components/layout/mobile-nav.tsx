'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Car, Home, MapPin, Info, User, LogIn, UserPlus, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import React from "react";

interface MobileNavProps {
    trigger: React.ReactNode;
}

const publicLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/cars', label: 'Browse Cars', icon: Car },
    { href: '/locations', label: 'Locations', icon: MapPin },
    { href: '/about', label: 'About', icon: Info },
];

const userLinks = [
    { href: '/rentals', label: 'My Rentals', icon: ClipboardList },
    { href: '/settings/profile', label: 'Profile', icon: User },
];

const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
];

export function MobileNav({ trigger }: MobileNavProps) {
    const pathname = usePathname();
    const { isAuthenticated, isAdmin, user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Image
                            src="/images/logo.svg"
                            alt="CarRental"
                            width={40}
                            height={40}
                            className="h-10 w-auto dark:invert"
                        />
                        <span>CarRental</span>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 py-4">
                    {publicLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <SheetClose asChild key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            </SheetClose>
                        );
                    })}

                    {isAuthenticated && (
                        <>
                            <div className="my-2 border-t" />
                            <p className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Account
                            </p>
                            {userLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;

                                return (
                                    <SheetClose asChild key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                );
                            })}

                            {isAdmin && (
                                <>
                                    <div className="my-2 border-t" />
                                    <p className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Admin
                                    </p>
                                    {adminLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = pathname.startsWith(link.href);

                                        return (
                                            <SheetClose asChild key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                        isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {link.label}
                                                </Link>
                                            </SheetClose>
                                        );
                                    })}
                                </>
                            )}
                        </>
                    )}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                                    <User className="h-4 w-4" />
                                </span>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-medium truncate">{user?.username}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <SheetClose asChild>
                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-600 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </Button>
                            </SheetClose>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <SheetClose asChild>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/login" className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Log in
                                    </Link>
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button asChild className="w-full">
                                    <Link href="/register" className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Sign up
                                    </Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

