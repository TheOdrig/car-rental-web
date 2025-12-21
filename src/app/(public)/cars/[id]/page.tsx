import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverGet } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CarDetail } from '@/components/cars';
import type { Car, CarAvailabilityCalendar } from '@/types';

interface CarDetailResponse {
    car: Car;
    calendar?: CarAvailabilityCalendar;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        notFound();
    }

    try {
        const data = await serverGet<CarDetailResponse>(
            `${endpoints.cars.byId(carId)}`,
            { tags: ['cars', `car-${carId}`] }
        );

        return (
            <main className="container mx-auto px-4 py-8">
                <CarDetail car={data.car} calendar={data.calendar} />
            </main>
        );
    } catch {
        notFound();
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        return { title: 'Car Not Found' };
    }

    try {
        const data = await serverGet<CarDetailResponse>(
            `${endpoints.cars.byId(carId)}`,
            { tags: ['cars', `car-${carId}`] }
        );

        return {
            title: `${data.car.brand} ${data.car.model} ${data.car.productionYear} | Car Rental`,
            description: `Rent ${data.car.brand} ${data.car.model} - ${data.car.fuelType ?? ''} ${data.car.transmissionType ?? ''}`.trim(),
        };
    } catch {
        return { title: 'Car Not Found' };
    }
}
