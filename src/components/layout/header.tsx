'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Menu, User } from 'lucide-react';
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

import { useState } from 'react';

export function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Car className="h-6 w-6 text-primary" />
                        <span>CarRental</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/cars" className="transition-colors hover:text-primary">
                        Browse Cars
                    </Link>
                    <Link href="/locations" className="text-muted-foreground transition-colors hover:text-foreground">
                        Locations
                    </Link>
                    <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                    ) : isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <User className="h-4 w-4" />
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard">Admin Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href="/rentals">My Rentals</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    <nav className="flex flex-col space-y-3">
                        <Link
                            href="/cars"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Browse Cars
                        </Link>
                        <Link
                            href="/locations"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Locations
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </Link>
                        {!isAuthenticated && (
                            <div className="flex flex-col gap-2 mt-4">
                                <Button variant="outline" asChild className="w-full justify-start">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                                </Button>
                                <Button asChild className="w-full justify-start">
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
