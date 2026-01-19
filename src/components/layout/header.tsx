'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';

const CurrencySelector = dynamic(
    () => import('./currency-selector').then(mod => mod.CurrencySelector),
    { ssr: false }
);

const MobileNav = dynamic(() => import('./mobile-nav').then(mod => mod.MobileNav), {
    ssr: false,
    loading: () => (
        <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
        </Button>
    ),
});

export function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                    <MobileNav
                        trigger={
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        }
                    />
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Image
                            src="/images/logo.svg"
                            alt="CarRental"
                            width={48}
                            height={48}
                            className="h-12 w-auto dark:invert"
                        />
                        <span>CarRental</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/cars" className="transition-colors hover:text-primary">
                        Browse Cars
                    </Link>
                    <Link href="/locations" className="text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                        Locations
                    </Link>
                    <Link href="/about" className="text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <CurrencySelector />
                    <ThemeToggle />
                    {isLoading ? (
                        <div className="h-9 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    ) : isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full hover:bg-transparent dark:hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border dark:border-slate-700" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{user?.username}</p>
                                        <p className="text-xs leading-none text-slate-600 dark:text-slate-400">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                                            <Link href="/admin/dashboard">Admin Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                                    <Link href="/rentals">My Rentals</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                                    <Link href="/damages">My Damages</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                                    <Link href="/settings/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20">
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Sign up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
