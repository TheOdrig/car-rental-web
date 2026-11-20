import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/features/admin';
import { getSession, isAdminSession } from '@/shared/server';
import { AdminTopBar } from './admin-top-bar';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await getSession();

    if (!session) {
        redirect(ROUTES.login);
    }

    if (!isAdminSession(session)) {
        redirect(ROUTES.forbidden);
    }

    return (
        <div className="flex min-h-dvh flex-col md:flex-row">
            <AdminSidebar username={session.username} />
            <div className="min-w-0 flex-1 bg-background">
                <AdminTopBar username={session.username} />
                <div className="container py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
