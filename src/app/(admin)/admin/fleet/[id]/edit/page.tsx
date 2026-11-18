import { notFound } from 'next/navigation';
import { EditCarContent } from './edit-car-content';

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
