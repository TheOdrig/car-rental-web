'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, User } from 'lucide-react';
import { AdminMobileMenu } from '@/features/admin';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/widgets/header';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { ROUTES } from '@/shared/config/routes';

export function AdminTopBar({ username }: { username: string }) {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push(ROUTES.home);
    };

    return (
        <div className="sticky top-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center pt-[env(safe-area-inset-top)] justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-2 md:hidden">
                <AdminMobileMenu username={username} />
                <Link href={ROUTES.admin.dashboard} className="flex min-h-11 items-center font-semibold">
                    Admin Panel
                </Link>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" className="min-w-11 sm:min-w-0" asChild>
                    <Link href={ROUTES.home} aria-label="View site">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">View site</span>
                    </Link>
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Account menu" className="h-11 w-11 rounded-full md:h-8 md:w-8 bg-muted">
                            <User className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.username ?? username}</p>
                                {user?.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={ROUTES.settings.profile}>Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-danger-subtle-foreground focus:text-danger-subtle-foreground">
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
