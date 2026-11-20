import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isApiError } from '@/shared/api';
import { pageMetadata } from '@/shared/lib';
import { SimilarCarsSection } from '@/entities/car';
import { getCar, getCarCalendar } from '@/entities/car/api/cached-fetchers';
import { CarBookingCard } from '@/widgets/car-booking-card';
import { ClientCarDetail } from './client-car-detail';
import { ROUTES } from '@/shared/config/routes';

interface PageProps {
    params: Promise<{ id: string }>;
}

function parseCarId(value: string): number | null {
    if (!/^[0-9]+$/.test(value)) {
        return null;
    }

    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function CarDetailPage({ params }: PageProps) {
    const { id } = await params;
    const carId = parseCarId(id);

    if (carId === null) {
        notFound();
    }

    let loaded;

    try {
        loaded = await Promise.all([getCar(carId), getCarCalendar(carId)]);
    } catch (error) {
        if (isApiError(error) && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const [car, calendar] = loaded;

    return (
        <div className="container mx-auto px-4 py-8">
            <ClientCarDetail
                car={car}
                initialCalendar={calendar}
                actionSlot={<CarBookingCard car={car} />}
            />
            <SimilarCarsSection carId={carId} className="mt-12 pt-12 border-t" />
        </div>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const carId = parseCarId(id);

    if (carId === null) {
        return { title: 'Car Not Found', robots: { index: false, follow: false } };
    }

    let car;

    try {
        car = await getCar(carId);
    } catch (error) {
        return {
            title: isApiError(error) && error.status === 404 ? 'Car Not Found' : 'Car',
            robots: { index: false, follow: false },
        };
    }

    return pageMetadata({
        title: `${car.brand} ${car.model} ${car.productionYear}`,
        description: `Rent ${car.brand} ${car.model} - ${car.fuelType ?? ''} ${car.transmissionType ?? ''}`.trim(),
        path: ROUTES.cars.detail(carId),
        image: car.imageUrl ?? car.thumbnailUrl ?? undefined,
    });
}