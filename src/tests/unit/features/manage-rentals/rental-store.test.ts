import { describe, it, expect, beforeEach } from 'vitest';
import { rentalActions, rentalStore } from '@/features/manage-rentals/model/rental-store';
import { createMockRental, createMockPaginatedRentals } from './fixtures';

describe('Rental Store', () => {
    beforeEach(() => {
        rentalActions.clearRentals();
    });

    describe('setRentals', () => {
        it('should set paginated rentals data', () => {
            const mockData = createMockPaginatedRentals();

            rentalActions.setRentals(mockData);

            expect(rentalStore.paginatedData).toEqual(mockData);
            expect(rentalActions.getPaginatedData()).toEqual(mockData);
        });

        it('should clear rentals list when setting paginated data', () => {
            const mockRental = createMockRental();
            rentalActions.setRentalsList([mockRental]);

            const mockData = createMockPaginatedRentals();
            rentalActions.setRentals(mockData);

            expect(rentalStore.rentals).toEqual([]);
        });
    });

    describe('setRentalsList', () => {
        it('should set rentals list', () => {
            const mockRentals = [createMockRental(), createMockRental({ id: 2 })];

            rentalActions.setRentalsList(mockRentals);

            expect(rentalStore.rentals).toEqual(mockRentals);
            expect(rentalActions.getRentals()).toEqual(mockRentals);
        });
    });

    describe('updateRental', () => {
        it('should update rental in list', () => {
            const mockRental = createMockRental();
            rentalActions.setRentalsList([mockRental]);

            const updatedRental = createMockRental({ status: 'Confirmed' });
            rentalActions.updateRental(updatedRental);

            expect(rentalStore.rentals[0].status).toBe('Confirmed');
        });

        it('should update selected rental if it matches', () => {
            const mockRental = createMockRental();
            rentalActions.setSelectedRental(mockRental);

            const updatedRental = createMockRental({ status: 'Confirmed' });
            rentalActions.updateRental(updatedRental);

            expect(rentalStore.selectedRental?.status).toBe('Confirmed');
        });

        it('should not update if rental not found', () => {
            const mockRental = createMockRental({ id: 1 });
            rentalActions.setRentalsList([mockRental]);

            const updatedRental = createMockRental({ id: 999, status: 'Confirmed' });
            rentalActions.updateRental(updatedRental);

            expect(rentalStore.rentals[0].status).toBe('Requested');
        });
    });

    describe('removeRental', () => {
        it('should remove rental from list', () => {
            const rental1 = createMockRental({ id: 1 });
            const rental2 = createMockRental({ id: 2 });
            rentalActions.setRentalsList([rental1, rental2]);

            rentalActions.removeRental(1);

            expect(rentalStore.rentals).toHaveLength(1);
            expect(rentalStore.rentals[0].id).toBe(2);
        });

        it('should clear selected rental if it matches', () => {
            const mockRental = createMockRental({ id: 1 });
            rentalActions.setRentalsList([mockRental]);
            rentalActions.setSelectedRental(mockRental);

            rentalActions.removeRental(1);

            expect(rentalStore.selectedRental).toBeNull();
        });
    });

    describe('setSelectedRental', () => {
        it('should set selected rental', () => {
            const mockRental = createMockRental();

            rentalActions.setSelectedRental(mockRental);

            expect(rentalStore.selectedRental).toEqual(mockRental);
            expect(rentalActions.getSelectedRental()).toEqual(mockRental);
        });

        it('should clear selected rental when null', () => {
            const mockRental = createMockRental();
            rentalActions.setSelectedRental(mockRental);

            rentalActions.setSelectedRental(null);

            expect(rentalStore.selectedRental).toBeNull();
        });
    });

    describe('clearRentals', () => {
        it('should clear all rental state', () => {
            const mockRental = createMockRental();
            const mockData = createMockPaginatedRentals();

            rentalActions.setRentalsList([mockRental]);
            rentalActions.setRentals(mockData);
            rentalActions.setSelectedRental(mockRental);

            rentalActions.clearRentals();

            expect(rentalStore.rentals).toEqual([]);
            expect(rentalStore.paginatedData).toBeNull();
            expect(rentalStore.selectedRental).toBeNull();
        });
    });
});
