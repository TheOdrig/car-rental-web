'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useProfile } from '@/features/user-settings';
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
import { ThemeToggle } from './theme-toggle';
import { ROUTES } from '@/shared/config/routes';

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

function AccountAvatar() {
    const { data: profile } = useProfile();

    return (
        <Avatar className="h-8 w-8 bg-accent">
            <AvatarImage src={profile?.avatarUrl} alt="" />
            <AvatarFallback className="bg-accent">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </AvatarFallback>
        </Avatar>
    );
}

export function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push(ROUTES.home);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b pt-[env(safe-area-inset-top)] border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <MobileNav
                        trigger={
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        }
                    />
                    <Link href={ROUTES.home} className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-lg font-bold sm:gap-2 sm:text-xl">
                        <Image
                            src="/images/logo.svg"
                            alt=""
                            width={48}
                            height={48}
                            className="h-9 w-auto shrink-0 sm:h-12 dark:invert"
                        />
                        <span className="sr-only min-[400px]:not-sr-only">Car Rental</span>
                    </Link>
                </div>

                <nav aria-label="Main" className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href={ROUTES.cars.list} className="transition-colors hover:text-primary">
                        Browse Cars
                    </Link>
                </nav>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <CurrencySelector />
                    <ThemeToggle />
                    {isLoading ? (
                        <div className="h-9 w-20 animate-pulse rounded bg-accent" />
                    ) : isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label="Account menu" className="relative h-8 w-8 shrink-0 rounded-full p-0 hover:bg-transparent dark:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <AccountAvatar />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-card border " align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-accent" />
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem asChild className="text-muted-foreground hover:bg-muted focus:bg-muted">
                                            <Link href={ROUTES.admin.dashboard}>Admin Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-accent" />
                                    </>
                                )}
                                <DropdownMenuItem asChild className="text-muted-foreground hover:bg-muted focus:bg-muted">
                                    <Link href={ROUTES.rentals.list}>My Rentals</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-muted-foreground hover:bg-muted focus:bg-muted">
                                    <Link href={ROUTES.damages.list}>My Damages</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-muted-foreground hover:bg-muted focus:bg-muted">
                                    <Link href={ROUTES.settings.profile}>Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-accent" />
                                <DropdownMenuItem onClick={handleLogout} className="text-danger-subtle-foreground focus:text-danger-subtle-foreground hover:bg-danger-subtle focus:bg-danger-subtle">
                                    Log Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Link href={ROUTES.login}>Log In</Link>
                            </Button>
                            <Button asChild>
                                <Link href={ROUTES.register}>Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
