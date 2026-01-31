import { redirect } from 'next/navigation';
import { getAccessToken } from '@/features/auth';
import React from "react";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const token = await getAccessToken();

    if (!token) {
        redirect('/login');
    }

    return <>{children}</>;
}
