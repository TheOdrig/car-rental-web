import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth/cookies';
import { AdminSidebar } from '@/components/admin';
import type { MeResponse } from '@/types';
import React from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

async function getCurrentUser(): Promise<MeResponse | null> {
    const token = await getAccessToken();

    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.userId,
            username: payload.sub,
            roles: payload.roles || [],
            exp: payload.exp,
        };
    } catch {
        return null;
    }
}

function isAdmin(user: MeResponse | null): boolean {
    return user?.roles.includes('ADMIN') ?? false;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (!isAdmin(user)) {
        redirect('/forbidden');
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar username={user.username} />
            <main className="flex-1 overflow-auto glass-bg-pattern">
                <div className="container py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

