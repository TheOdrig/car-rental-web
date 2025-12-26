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
}

export interface CarFormSectionProps<T extends Partial<CarFormData>> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    onUpdate: (field: keyof T, value: T[keyof T]) => void;
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
};
