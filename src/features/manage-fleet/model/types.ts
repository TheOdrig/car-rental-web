import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import type { CurrencyType } from '@/shared/types';

export interface FleetStatistics {
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

export interface CarFormData {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;
    fuelType: string;
    transmissionType: string;
    bodyType: string;
    seats: number;
    color: string;
    dailyRate: number;
    currencyType: CurrencyType;
    imageUrl: string;
}

export const defaultCarFormData: CarFormData = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    fuelType: '',
    transmissionType: '',
    bodyType: '',
    seats: 5,
    color: '',
    dailyRate: 0,
    currencyType: DEFAULT_CURRENCY,
    imageUrl: '',
};