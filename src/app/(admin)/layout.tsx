import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/features/admin';
import { getSession, isAdminSession } from '@/shared/server';

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
            <main className="flex-1 overflow-auto glass-bg-pattern">
                <div className="container py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
