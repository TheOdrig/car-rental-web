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
    isFeatured?: boolean;
    rating?: number | string;
    imageUrl?: string;
    vin?: string;
}

function stripToAlphanumeric(value: string): string {
    return value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
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
        currencyType: 'USD',
        carStatusType: 'Available',
        kilometer: Number(body.kilometer) || 0,
        doors: Number(body.doors) || 4,
        isFeatured: !!body.isFeatured,
        isTestDriveAvailable: true,
        rating: Number(body.rating) || 5.0,
        imageUrl: body.imageUrl || fallbackImage,
    };

    if (body.vin && body.vin.length === 17) {
        request.vinNumber = stripToAlphanumeric(body.vin);
    }

    return request;
}
