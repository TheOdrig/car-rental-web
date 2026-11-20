import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CustomerDetailContent } from './customer-detail-content';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = { title: 'Customer Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect(ROUTES.admin.users);
    }

    return <CustomerDetailContent id={id} />;
}
