import type { Schemas, WithRequired } from '@/shared/api/contract';

type CarSchemas = Pick<Schemas, 'CarResponse' | 'CarSummaryResponse' | 'AvailableCarDto' | 'SimilarCarDto'>;

export type CarStatus = NonNullable<CarSchemas['CarResponse']['carStatusType']>;

export type CarSummary = WithRequired<CarSchemas['CarSummaryResponse'], 'id' | 'licensePlate' | 'brand' | 'model'>;

export enum FuelType {
    GASOLINE = 'GASOLINE',
    DIESEL = 'DIESEL',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
}
export enum TransmissionType {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC',
}
export type Car = WithRequired<
    CarSchemas['CarResponse'],
    'id' | 'licensePlate' | 'brand' | 'model' | 'productionYear' | 'price' | 'currencyType' | 'carStatusType'
>;
export type AvailableCar = WithRequired<
    CarSchemas['AvailableCarDto'],
    'id' | 'brand' | 'model' | 'productionYear' | 'dailyRate' | 'totalPrice' | 'currency'
>;
export type AvailabilitySearchRequest = Omit<
    Schemas['AvailabilitySearchRequest'],
    'endDateAfterStartDate' | 'maxPriceGreaterThanMinPrice' | 'maxYearGreaterThanMinYear'
>;
export type AvailabilitySearchResponse = WithRequired<
    Omit<Schemas['AvailabilitySearchResponse'], 'cars'>,
    'totalElements' | 'totalPages' | 'currentPage' | 'pageSize' | 'searchStartDate' | 'searchEndDate' | 'rentalDays'
> & { cars: AvailableCar[] };
export type DayAvailability = WithRequired<Schemas['DayAvailabilityDto'], 'date' | 'status'>;
export type DayAvailabilityStatus = DayAvailability['status'];
export type CarAvailabilityCalendar = WithRequired<
    Omit<Schemas['CarAvailabilityCalendarDto'], 'days'>,
    'carId' | 'carName' | 'month' | 'carBlocked'
> & { days: DayAvailability[] };
export type SimilarCar = WithRequired<
    CarSchemas['SimilarCarDto'],
    'id' | 'brand' | 'model' | 'productionYear' | 'dailyRate' | 'totalPrice' | 'currency'
>;
export interface CarFilters {
    brand?: string;
    model?: string;
    fuelType?: string;
    transmissionType?: string;
    bodyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minSeats?: number;
    minProductionYear?: number;
    maxProductionYear?: number;
    carStatusType?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';


export type FleetStatus = Required<Schemas['FleetStatusDto']>;

export interface VehicleStatistics {
    totalRentals: number;
    totalRevenue: number;
    totalDaysRented: number;
    occupancyRate: number;
    averageRentalDuration: number;
    lastRentalDate?: string;
    totalDamageReports: number;
    totalDamageCost: number;
    averageRating?: number;
}

export interface VehicleImages {
    primary: string;
    additional: string[];
}

export interface VehicleCurrentStatus {
    status: string;
    statusColor: string;
    isAvailable: boolean;
    description?: string;
    lastChangedAt: string;
    lastChangedBy?: string;
    nextAvailableDate?: string;
    activeRentalId?: number;
}

export interface VehicleDetailResponse {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
    color: string;
    fuelType: string;
    transmissionType: string;
    bodyType: string;
    seats: number;
    vin?: string;
    images: VehicleImages;
    pricing: {
        dailyRate: number;
        weeklyRate: number;
        depositAmount: number;
        currency: string;
    };
    statistics?: VehicleStatistics;
    currentStatus?: VehicleCurrentStatus;
    status?: string;
}

export type PricingRequest = Schemas['PricingRequest'];
export type PricingModifier = WithRequired<
    Schemas['ModifierDto'],
    'strategyName' | 'multiplier' | 'description' | 'isDiscount' | 'formattedPercentage'
>;
export type PricingResponse = WithRequired<
    Omit<Schemas['PricingResponse'], 'appliedModifiers'>,
    | 'basePrice'
    | 'baseTotalPrice'
    | 'finalPrice'
    | 'effectiveDailyPrice'
    | 'totalSavings'
    | 'combinedMultiplier'
    | 'rentalDays'
> & { appliedModifiers: PricingModifier[] };
