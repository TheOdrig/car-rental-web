import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DamageDetailContent } from '@/widgets/admin-damages';
import { isNumericId } from '@/shared/lib/numeric-id';

export const metadata: Metadata = { title: 'Admin Damage Report' };

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DamageDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        notFound();
    }

    return <DamageDetailContent id={id} />;
}
