import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/features/admin';
import { getSession, isAdminSession } from '@/shared/server';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (!isAdminSession(session)) {
        redirect('/forbidden');
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar username={session.username} />
            <div className="flex-1 overflow-auto glass-bg-pattern">
                <div className="container py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
