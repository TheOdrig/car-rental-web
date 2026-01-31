import { create } from 'zustand';
import { Rental } from './types';

interface RentalState {
    rentals: Rental[];
    activeRental: Rental | null;
    setRentals: (rentals: Rental[]) => void;
    setActiveRental: (rental: Rental | null) => void;
    addRental: (rental: Rental) => void;
    updateRentalStatus: (id: number, status: Rental['status']) => void;
}

export const useRentalStore = create<RentalState>((set) => ({
    rentals: [],
    activeRental: null,
    setRentals: (rentals) => set({ rentals }),
    setActiveRental: (activeRental) => set({ activeRental }),
    addRental: (rental) => set((state) => ({ rentals: [...state.rentals, rental] })),
    updateRentalStatus: (id, status) =>
        set((state) => ({
            rentals: state.rentals.map((r) => (r.id === id ? { ...r, status } : r)),
            activeRental:
                state.activeRental?.id === id
                    ? { ...state.activeRental, status }
                    : state.activeRental,
        })),
}));