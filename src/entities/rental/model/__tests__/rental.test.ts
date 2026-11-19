import { describe, it, expect } from 'vitest';
import { type Rental, RentalStatus, isActive, canCancel, getFormattedRentalPeriod, getFormattedTotal } from '@/entities/rental';
const mockRental: Rental = {
  id: 1,
  startDate: '2023-12-01T10:00:00Z',
  endDate: '2023-12-05T10:00:00Z',
  totalPrice: 200,
  status: RentalStatus.REQUESTED,
};
const activeRental: Rental = {
  ...mockRental,
  id: 2,
  status: RentalStatus.IN_USE,
  startDate: '2023-12-01T10:00:00Z',
};
const completedRental: Rental = {
  ...mockRental,
  id: 3,
  status: RentalStatus.RETURNED,
};
describe('Rental Entity', () => {
  describe('Utils', () => {
    describe('isActive', () => {
      it('should return true for ACTIVE status', () => {
        expect(isActive(activeRental)).toBe(true);
      });
      it('should return false for other statuses', () => {
        expect(isActive(mockRental)).toBe(false);
      });
    });
    describe('canCancel', () => {
      it('should return true for REQUESTED status', () => {
        expect(canCancel(mockRental)).toBe(true);
      });
      const confirmedRental = { ...mockRental, status: RentalStatus.CONFIRMED };
      it('should return true for CONFIRMED status', () => {
        expect(canCancel(confirmedRental)).toBe(true);
      });
      it('should return false for ACTIVE status', () => {
        expect(canCancel(activeRental)).toBe(false);
      });
      it('should return false for COMPLETED status', () => {
        expect(canCancel(completedRental)).toBe(false);
      });
    });
    describe('getFormattedRentalPeriod', () => {
      it('should format date range correctly', () => {
        const period = getFormattedRentalPeriod(mockRental);
        expect(period).toContain('Dec 1, 2023');
        expect(period).toContain('Dec 5, 2023');
      });
    });
    describe('getFormattedTotal', () => {
      it('should format price correctly', () => {
        expect(getFormattedTotal(mockRental)).toBe('$200.00');
      });
    });
  });
});