import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VehicleDetailContent } from './vehicle-detail-content';

export const metadata: Metadata = { title: 'Vehicle Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function VehicleDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect('/admin/fleet');
    }

    return <VehicleDetailContent id={id} />;
}
