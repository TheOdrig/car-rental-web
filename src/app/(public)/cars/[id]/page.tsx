import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverGet } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CarDetail } from '@/components/cars';
import type { Car, CarAvailabilityCalendar } from '@/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        notFound();
    }

    let car: Car;
    let calendar: CarAvailabilityCalendar | undefined;

    try {
        car = await serverGet<Car>(
            endpoints.cars.byId(carId),
            { tags: ['cars', `car-${carId}`] }
        );
    } catch {
        notFound();
    }

    try {
        calendar = await serverGet<CarAvailabilityCalendar>(
            endpoints.cars.availability.calendar(carId),
            { tags: [`car-${carId}-calendar`] }
        );
    } catch {
        // Calendar is optional, continue without it
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

    try {
        const car = await serverGet<Car>(
            endpoints.cars.byId(carId),
            { tags: ['cars', `car-${carId}`] }
        );

        return {
            title: `${car.brand} ${car.model} ${car.productionYear} | Car Rental`,
            description: `Rent ${car.brand} ${car.model} - ${car.fuelType ?? ''} ${car.transmissionType ?? ''}`.trim(),
        };
    } catch {
        return { title: 'Car Not Found' };
    }
}
