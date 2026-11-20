import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VehicleDetailContent } from '@/widgets/admin-fleet';
import { ROUTES } from '@/shared/config/routes';
import { isNumericId } from '@/shared/lib/numeric-id';

export const metadata: Metadata = { title: 'Vehicle Details' };

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function VehicleDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        redirect(ROUTES.admin.fleet);
    }

    return <VehicleDetailContent id={id} />;
}
