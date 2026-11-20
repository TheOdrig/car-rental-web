import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RentalDetailContent } from '@/widgets/rental-detail';
import { isNumericId } from '@/shared/lib/numeric-id';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Rental Details' };

export default async function RentalDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        notFound();
    }

    return <RentalDetailContent id={id} />;
}
