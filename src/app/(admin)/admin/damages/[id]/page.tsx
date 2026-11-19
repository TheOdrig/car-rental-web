import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DamageDetailContent } from './damage-detail-content';

export const metadata: Metadata = { title: 'Admin Damage Report' };

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function DamageDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        notFound();
    }

    return <DamageDetailContent id={id} />;
}
