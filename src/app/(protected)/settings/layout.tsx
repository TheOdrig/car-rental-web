'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    Shield,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import { PageHeader } from '@/shared/ui/page-header';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { ROUTES } from '@/shared/config/routes';

interface SettingsLayoutProps {
    children: ReactNode;
}

const SETTINGS_TABS = [
    { label: 'Personal Info', href: ROUTES.settings.profile, icon: User },
    { label: 'Security', href: ROUTES.settings.security, icon: Shield },
    { label: 'Payment Methods', href: ROUTES.settings.payment, icon: CreditCard },
];

function SettingsBreadcrumb({ currentTab }: { currentTab?: string }) {
    return (
        <Breadcrumb
            className="mb-6"
            items={[
                { label: 'Settings', href: ROUTES.settings.root },
                ...(currentTab ? [{ label: currentTab }] : []),
            ]}
        />
    );
}

function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Settings" className="w-full space-y-1 lg:w-64">
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
                        <span className="flex-1">{tab.label}</span>
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
            <SettingsBreadcrumb currentTab={currentTab} />

            <PageHeader area="customer" className="mb-8" title="Settings" description="Manage your account settings and preferences" />

            <div className="flex flex-col gap-8 lg:flex-row">
                <SettingsSidebar />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}