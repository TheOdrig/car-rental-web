import { ApiError } from '@/shared/api/error';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/shared/config/constants';

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

const CAR_REQUEST_FIELDS = [
    'bodyType',
    'brand',
    'carStatusType',
    'color',
    'currencyType',
    'doors',
    'engineDisplacement',
    'engineType',
    'fuelType',
    'imageUrl',
    'inspectionExpiryDate',
    'insuranceExpiryDate',
    'kilometer',
    'lastServiceDate',
    'licensePlate',
    'model',
    'nextServiceDate',
    'notes',
    'price',
    'productionYear',
    'rating',
    'registrationDate',
    'seats',
    'thumbnailUrl',
    'transmissionType',
    'vinNumber',
] as const;

const VIN_LENGTH = 17;
const IMAGE_URL_PATTERN = /^https?:\/\/.+$/;

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

function validationError(field: string, message: string): ApiError {
    return new ApiError({
        status: 400,
        message: 'Validation failed',
        timestamp: new Date().toISOString(),
        errors: [{ field, message }],
    });
}

function definedNumber(value: number | string | undefined): number | undefined {
    if (value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function toBackendCar(body: CarFormBody): Record<string, unknown> {
    const request: Record<string, unknown> = {
        brand: body.brand?.replace(/-/g, ' '),
        model: body.model,
        productionYear: Number(body.year),
        licensePlate: body.licensePlate ? stripToAlphanumeric(body.licensePlate) : undefined,
        fuelType: body.fuelType,
        transmissionType: body.transmissionType,
        bodyType: body.bodyType,
        seats: definedNumber(body.seats),
        color: body.color,
        price: Number(body.dailyRate),
        currencyType: resolveCurrency(body.currencyType),
        kilometer: definedNumber(body.kilometer),
        doors: definedNumber(body.doors),
        rating: definedNumber(body.rating),
    };

    const imageUrl = body.imageUrl?.trim();
    if (imageUrl) {
        if (!IMAGE_URL_PATTERN.test(imageUrl)) {
            throw validationError('imageUrl', 'Image URL must start with http:// or https://');
        }
        request.imageUrl = imageUrl;
    }

    const vin = body.vin ? stripToAlphanumeric(body.vin) : '';
    if (vin) {
        if (vin.length !== VIN_LENGTH) {
            throw validationError('vinNumber', `VIN must be exactly ${VIN_LENGTH} characters`);
        }
        request.vinNumber = vin;
    }

    return request;
}

export function carCreateRequest(body: CarFormBody): Record<string, unknown> {
    return { ...toBackendCar(body), carStatusType: 'Available' };
}

export function carUpdateRequest(current: Record<string, unknown>, body: CarFormBody): Record<string, unknown> {
    const base: Record<string, unknown> = {};
    for (const field of CAR_REQUEST_FIELDS) {
        const value = current[field];
        if (value !== undefined && value !== null) base[field] = value;
    }

    const changes = toBackendCar(body);
    for (const [key, value] of Object.entries(changes)) {
        if (value !== undefined && !(typeof value === 'number' && Number.isNaN(value))) {
            base[key] = value;
        }
    }

    return base;
}
