import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MyDamageDetailContent } from './my-damage-detail-content';
import { isNumericId } from '@/shared/lib/numeric-id';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Damage Report' };

export default async function MyDamageDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        notFound();
    }

    return <MyDamageDetailContent id={id} />;
}
