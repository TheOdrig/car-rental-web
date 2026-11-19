import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditCarContent } from './edit-car-content';

export const metadata: Metadata = { title: 'Edit Vehicle' };

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: PageProps) {
    const { id } = await params;

    if (!/^[0-9]+$/.test(id) || !Number.isSafeInteger(Number(id))) {
        notFound();
    }

    return <EditCarContent />;
}
