import type { Rental } from '@/entities/rental';
import type { PaginatedRentals } from './types';

interface RentalState {
    rentals: Rental[];
    paginatedData: PaginatedRentals | null;
    selectedRental: Rental | null;
}

export const rentalStore: RentalState = {
    rentals: [],
    paginatedData: null,
    selectedRental: null,
};

export const rentalActions = {
    setRentals(data: PaginatedRentals): void {
        rentalStore.paginatedData = data;
        rentalStore.rentals = [];
    },

    setRentalsList(rentals: Rental[]): void {
        rentalStore.rentals = rentals;
    },

    updateRental(updatedRental: Rental): void {
        const index = rentalStore.rentals.findIndex(r => r.id === updatedRental.id);
        if (index !== -1) {
            rentalStore.rentals[index] = updatedRental;
        }

        if (rentalStore.selectedRental?.id === updatedRental.id) {
            rentalStore.selectedRental = updatedRental;
        }
    },

    removeRental(rentalId: number): void {
        rentalStore.rentals = rentalStore.rentals.filter(r => r.id !== rentalId);

        if (rentalStore.selectedRental?.id === rentalId) {
            rentalStore.selectedRental = null;
        }
    },

    setSelectedRental(rental: Rental | null): void {
        rentalStore.selectedRental = rental;
    },

    clearRentals(): void {
        rentalStore.rentals = [];
        rentalStore.paginatedData = null;
        rentalStore.selectedRental = null;
    },

    getRentals(): Rental[] {
        return rentalStore.rentals;
    },

    getPaginatedData(): PaginatedRentals | null {
        return rentalStore.paginatedData;
    },

    getSelectedRental(): Rental | null {
        return rentalStore.selectedRental;
    },
};