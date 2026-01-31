import type { CarStatus, VehicleStatistics, VehicleCurrentStatus, VehicleActiveRental } from '@/entities/car';

export interface FleetStatistics {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    reservedCars: number;
    maintenanceCars: number;
    inspectionCars: number;
    damagedCars: number;
    soldCars?: number;
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
    weeklyRate: number;
    depositAmount: number;
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
    weeklyRate: 0,
    depositAmount: 0,
    imageUrl: '',
};