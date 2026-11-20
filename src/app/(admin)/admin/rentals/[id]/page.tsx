import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RentalDetailContent } from './rental-detail-content';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = { title: 'Admin Rental Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function RentalDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect(ROUTES.admin.rentals);
    }

    return <RentalDetailContent id={id} />;
}
