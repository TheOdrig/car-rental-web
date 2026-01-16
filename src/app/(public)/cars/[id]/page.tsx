import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCar, getCarCalendar } from '@/lib/api/cached-fetchers';
import { CarDetail } from '@/components/cars';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        notFound();
    }

    let car;
    let calendar;

    try {
        [car, calendar] = await Promise.all([
            getCar(carId),
            getCarCalendar(carId),
        ]);
    } catch {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <CarDetail car={car} calendar={calendar} />
        </main>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        return { title: 'Car Not Found' };
    }

    let car;

    try {
        car = await getCar(carId);
    } catch {
        return { title: 'Car Not Found' };
    }

    return {
        title: `${car.brand} ${car.model} ${car.productionYear} | Car Rental`,
        description: `Rent ${car.brand} ${car.model} - ${car.fuelType ?? ''} ${car.transmissionType ?? ''}`.trim(),
    };
}
