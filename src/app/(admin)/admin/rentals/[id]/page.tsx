import { redirect } from 'next/navigation';
import { RentalDetailContent } from './rental-detail-content';

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function RentalDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect('/admin/rentals');
    }

    return <RentalDetailContent id={id} />;
}
