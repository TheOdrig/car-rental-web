import { describe, it, expect, beforeEach } from 'vitest';
import { useRentalStore } from '@/entities/rental/model/store';
import { Rental, RentalStatus } from '@/entities/rental/model/types';
import { isActive, canCancel, getFormattedRentalPeriod, getFormattedTotal } from '@/entities/rental/lib/utils';
import { act } from 'react';

const mockRental: Rental = {
  id: 1,
  userId: 1,
  carId: 1,
  startDate: '2023-12-01T10:00:00Z',
  endDate: '2023-12-05T10:00:00Z',
  totalPrice: 200,
  status: RentalStatus.PENDING,
};

const activeRental: Rental = {
  ...mockRental,
  id: 2,
  status: RentalStatus.ACTIVE,
  startDate: '2023-12-01T10:00:00Z',
};

const completedRental: Rental = {
  ...mockRental,
  id: 3,
  status: RentalStatus.COMPLETED,
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
      it('should return true for PENDING status', () => {
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
        expect(period).toContain('December 1, 2023');
        expect(period).toContain('December 5, 2023');
      });
    });

    describe('getFormattedTotal', () => {
      it('should format price correctly', () => {
        expect(getFormattedTotal(mockRental)).toBe('$200.00');
      });
    });
  });

  describe('Store', () => {
    beforeEach(() => {
        act(() => {
             useRentalStore.setState({ rentals: [], activeRental: null });
        })
    });

    it('should set rentals list', () => {
      const { setRentals } = useRentalStore.getState();
      
      act(() => {
          setRentals([mockRental, activeRental]);
      })

      const state = useRentalStore.getState();
      expect(state.rentals).toHaveLength(2);
    });

    it('should add a rental', () => {
      const { addRental } = useRentalStore.getState();
      
      act(() => {
          addRental(mockRental);
      })

      const state = useRentalStore.getState();
      expect(state.rentals).toHaveLength(1);
      expect(state.rentals[0]).toEqual(mockRental);
    });

    it('should set active rental', () => {
      const { setActiveRental } = useRentalStore.getState();
      
      act(() => {
          setActiveRental(activeRental);
      })
      
      const state = useRentalStore.getState();
      expect(state.activeRental).toEqual(activeRental);
    });

    it('should update rental status', () => {
      const { setRentals, setActiveRental, updateRentalStatus } = useRentalStore.getState();
      
      act(() => {
          setRentals([mockRental]);
          setActiveRental(mockRental);
          updateRentalStatus(1, RentalStatus.CANCELLED);
      })

      const state = useRentalStore.getState();
      expect(state.rentals[0].status).toBe(RentalStatus.CANCELLED);
      expect(state.activeRental?.status).toBe(RentalStatus.CANCELLED);
    });
    
    it('should handle updating status when rental not found', () => {
        const { updateRentalStatus } = useRentalStore.getState();
        
        act(() => {
            updateRentalStatus(999, RentalStatus.CANCELLED);
        })
        
        const state = useRentalStore.getState();
        expect(state.rentals).toHaveLength(0);
    });
  });
});
