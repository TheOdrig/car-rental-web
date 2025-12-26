'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    Shield,
    FileText,
    Bell,
    CreditCard,
    ChevronRight,
    Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
    children: ReactNode;
}

const SETTINGS_TABS = [
    { label: 'Personal Info', href: '/settings/profile', icon: User },
    { label: 'Security', href: '/settings/security', icon: Shield },
    { label: 'Documents', href: '/settings/documents', icon: FileText },
    { label: 'Notifications', href: '/settings/notifications', icon: Bell },
    { label: 'Payment Methods', href: '/settings/payment', icon: CreditCard },
];

function Breadcrumb({ currentTab }: { currentTab?: string }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                <li>
                    <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                    <Link
                        href="/settings"
                        className="transition-colors hover:text-foreground"
                    >
                        Settings
                    </Link>
                </li>
                {currentTab && (
                    <>
                        <li>
                            <ChevronRight className="h-4 w-4" />
                        </li>
                        <li>
                            <span className="font-medium text-foreground">{currentTab}</span>
                        </li>
                    </>
                )}
            </ol>
        </nav>
    );
}

function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="w-full space-y-1 lg:w-64">
            {SETTINGS_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();
    const currentTab = SETTINGS_TABS.find((tab) => pathname === tab.href)?.label;

    return (
        <div className="container py-8">
            <Breadcrumb currentTab={currentTab} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                <SettingsSidebar />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
