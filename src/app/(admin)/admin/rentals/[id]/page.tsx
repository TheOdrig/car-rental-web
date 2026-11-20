import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RentalDetailContent } from '@/widgets/admin-rental-detail';
import { ROUTES } from '@/shared/config/routes';
import { isNumericId } from '@/shared/lib/numeric-id';

export const metadata: Metadata = { title: 'Admin Rental Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RentalDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect(ROUTES.admin.rentals);
    }

    return <RentalDetailContent id={id} />;
}
