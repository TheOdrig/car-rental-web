import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CustomerDetailContent } from '@/widgets/admin-customer-detail';
import { ROUTES } from '@/shared/config/routes';
import { isNumericId } from '@/shared/lib/numeric-id';

export const metadata: Metadata = { title: 'Customer Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect(ROUTES.admin.users);
    }

    return <CustomerDetailContent id={id} />;
}
