import { notFound } from 'next/navigation';
import { MyDamageDetailContent } from './my-damage-detail-content';

interface PageProps {
    params: Promise<{ id: string }>;
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export default async function MyDamageDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!isNumericId(id)) {
        notFound();
    }

    return <MyDamageDetailContent id={id} />;
}
