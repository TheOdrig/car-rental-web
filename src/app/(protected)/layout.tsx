import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/shared/server';

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return <>{children}</>;
}
