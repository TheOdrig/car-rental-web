import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SimilarCarsSection } from '@/entities/car';
import { getCar, getCarCalendar } from '@/entities/car/api/cached-fetchers';
import { CarBookingCard } from '@/widgets/car-booking-card';
import { ClientCarDetail } from './client-car-detail';

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

    if (!car) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <ClientCarDetail
                car={car}
                initialCalendar={calendar}
                actionSlot={<CarBookingCard car={car} />}
            />
            <SimilarCarsSection carId={carId} className="mt-12 pt-12 border-t" />
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