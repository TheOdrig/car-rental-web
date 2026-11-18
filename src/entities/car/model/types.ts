import { CurrencyType } from '@/shared/types/common';

export type CarStatus =
    | 'Available'
    | 'Rented'
    | 'Maintenance'
    | 'Reserved'
    | 'Damaged'
    | 'Inspection';

export interface CarSummary {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    productionYear: number;
    formattedPrice: string;
    currencyType: CurrencyType;
    carStatusType: CarStatus;
    color?: string;
    kilometer?: number;
    thumbnailUrl?: string;
}

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
export interface Car {
    id: number;
    licensePlate: string;
    vinNumber?: string;
    brand: string;
    model: string;
    productionYear: number;
    price: number;
    currencyType: CurrencyType;
    damagePrice?: number;
    carStatusType: CarStatus;
    engineType?: string;
    engineDisplacement?: number;
    fuelType?: string;
    transmissionType?: string;
    bodyType?: string;
    color?: string;
    kilometer?: number;
    doors?: number;
    seats?: number;
    registrationDate?: string;
    lastServiceDate?: string;
    nextServiceDate?: string;
    insuranceExpiryDate?: string;
    inspectionExpiryDate?: string;
    notes?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    rating?: number;
    createTime?: string;
    updateTime?: string;
    version?: number;
    isAvailable?: boolean;
    canBeReserved?: boolean;
    requiresAttention?: boolean;
    formattedPrice?: string;
    age?: number;
    isNew?: boolean;
    fullName?: string;
    displayName?: string;
    hasDamage?: boolean;
    totalPrice?: number;
    needsService?: boolean;
    convertedPrice?: number;
    displayCurrency?: CurrencyType;
    exchangeRate?: number;
    rateSource?: string;
}
export interface AvailableCar {
    id: number;
    brand: string;
    model: string;
    productionYear: number;
    bodyType?: string;
    fuelType?: string;
    transmissionType?: string;
    seats?: number;
    imageUrl?: string;
    rating?: number;
    dailyRate: number;
    totalPrice: number;
    currency: CurrencyType;
    appliedDiscounts?: string[];
}
export interface AvailabilitySearchRequest {
    startDate: string;
    endDate: string;
    brand?: string;
    model?: string;
    fuelType?: string;
    transmissionType?: string;
    bodyType?: string;
    minSeats?: number;
    minPrice?: number;
    maxPrice?: number;
    minProductionYear?: number;
    maxProductionYear?: number;
    targetCurrency?: CurrencyType;
    sortBy?: string;
    sortDirection?: string;
    page?: number;
    size?: number;
}
export interface AvailabilitySearchResponse {
    cars: AvailableCar[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    searchStartDate: string;
    searchEndDate: string;
    rentalDays: number;
}
export type DayAvailabilityStatus = 'Available' | 'Unavailable';
export interface DayAvailability {
    date: string;
    status: DayAvailabilityStatus;
    rentalId?: number;
}
export interface CarAvailabilityCalendar {
    carId: number;
    carName: string;
    month: string;
    days: DayAvailability[];
    carBlocked: boolean;
    blockReason?: string;
}
export interface SimilarCar {
    id: number;
    brand: string;
    model: string;
    productionYear: number;
    bodyType?: string;
    dailyRate: number;
    totalPrice: number;
    currency: CurrencyType;
    imageUrl?: string;
    similarityReasons?: string[];
    similarityScore?: number;
}
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
export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating-desc';


export interface FleetStatus {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    reservedCars: number;
    maintenanceCars: number;
    inspectionCars: number;
    damagedCars: number;
    occupancyRate: number;
    generatedAt: string;
}

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

export interface VehicleActiveRental {
    id: number;
    customerId: number;
    customerName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
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
    activeRental?: VehicleActiveRental;
    status?: string;
}