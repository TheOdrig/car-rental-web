import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/shared/server';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const session = await getSession();

    if (!session) {
        redirect(ROUTES.login);
    }

    return <>{children}</>;
}
