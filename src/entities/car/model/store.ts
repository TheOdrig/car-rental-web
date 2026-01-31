import { create } from 'zustand';
import { Car } from './types';

interface CarState {
    cars: Car[];
    selectedCar: Car | null;
    setCars: (cars: Car[]) => void;
    selectCar: (car: Car | null) => void;
    updateCarStatus: (carId: number, status: Car['carStatusType']) => void;
}

export const useCarStore = create<CarState>((set) => ({
    cars: [],
    selectedCar: null,
    setCars: (cars) => set({ cars }),
    selectCar: (selectedCar) => set({ selectedCar }),
    updateCarStatus: (carId, status) =>
        set((state) => ({
            cars: state.cars.map((car) =>
                car.id === carId ? { ...car, carStatusType: status } : car
            ),
            selectedCar:
                state.selectedCar?.id === carId
                    ? { ...state.selectedCar, carStatusType: status }
                    : state.selectedCar,
        })),
}));
