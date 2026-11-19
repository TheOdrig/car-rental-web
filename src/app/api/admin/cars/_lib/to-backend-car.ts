import { ApiError } from '@/shared/api/error';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/shared/config/constants';

export const DEFAULT_CAR_IMAGE = '/images/car-placeholder.svg';

export interface CarFormBody {
    brand?: string;
    model?: string;
    year?: number | string;
    licensePlate?: string;
    fuelType?: string;
    transmissionType?: string;
    bodyType?: string;
    seats?: number | string;
    color?: string;
    dailyRate?: number | string;
    kilometer?: number | string;
    doors?: number | string;
    rating?: number | string;
    imageUrl?: string;
    vin?: string;
    currencyType?: string;
}

function stripToAlphanumeric(value: string): string {
    return value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function resolveCurrency(value: string | undefined): string {
    if (value === undefined || value === '') {
        return DEFAULT_CURRENCY;
    }
    const upper = value.toUpperCase();
    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(upper)) {
        throw new ApiError(400, 'Unsupported currency');
    }
    return upper;
}

export function toBackendCar(body: CarFormBody, fallbackImage: string | undefined): Record<string, unknown> {
    const request: Record<string, unknown> = {
        brand: body.brand?.replace(/-/g, ' '),
        model: body.model,
        productionYear: Number(body.year),
        licensePlate: body.licensePlate ? stripToAlphanumeric(body.licensePlate) : undefined,
        fuelType: body.fuelType,
        transmissionType: body.transmissionType,
        bodyType: body.bodyType,
        seats: Number(body.seats) || 5,
        color: body.color,
        price: Number(body.dailyRate),
        currencyType: resolveCurrency(body.currencyType),
        carStatusType: 'Available',
        kilometer: Number(body.kilometer) || 0,
        doors: Number(body.doors) || 4,
        rating: Number(body.rating) || 5.0,
        imageUrl: body.imageUrl || fallbackImage,
    };

    if (body.vin && body.vin.length === 17) {
        request.vinNumber = stripToAlphanumeric(body.vin);
    }

    return request;
}
