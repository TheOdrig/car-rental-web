import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiError } from '@/shared/api';

const notFoundMock = vi.hoisted(() => vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
}));
const useRentalMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    notFound: notFoundMock,
}));
vi.mock('@/entities/rental', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/entities/rental')>();
    return { ...original, useRental: useRentalMock };
});
vi.mock('@/features/user-settings', () => ({ useProfile: () => ({ data: undefined }) }));
vi.mock('@/features/manage-rentals', () => ({
    RentalDetail: () => <div>rental detail</div>,
    RentalDetailSkeleton: () => <div>loading</div>,
}));

import { RentalDetailContent } from '../rental-detail-content';

function problem(status: number, code: string) {
    return new ApiError({ status, message: 'x', timestamp: new Date().toISOString(), code });
}

describe('RentalDetailContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the not-found state when the API answers 404 for a rental the user does not own', () => {
        useRentalMock.mockReturnValue({ data: undefined, isLoading: false, error: problem(404, 'RENTAL_NOT_FOUND'), refetch: vi.fn() });

        expect(() => render(<RentalDetailContent id="5" />)).toThrow('NEXT_NOT_FOUND');
        expect(notFoundMock).toHaveBeenCalled();
    });

    it('shows a retryable error instead of not-found when loading fails for another reason', () => {
        useRentalMock.mockReturnValue({ data: undefined, isLoading: false, error: problem(500, 'INTERNAL_SERVER_ERROR'), refetch: vi.fn() });

        render(<RentalDetailContent id="5" />);

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByText('Failed to load the rental')).toBeInTheDocument();
    });
});
