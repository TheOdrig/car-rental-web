import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { ApiError } from '@/shared/api';
import { BookingForm } from '../booking-form';
import { createBooking } from '../../api/booking-api';

vi.mock('../../api/booking-api', () => ({
    createBooking: vi.fn(),
}));

const mockCreateBooking = vi.mocked(createBooking);

function submit() {
    fireEvent.submit(screen.getByRole('button', { name: /book now/i }).closest('form')!);
}

function setDate(input: HTMLElement, value: string) {
    fireEvent.change(input, { target: { value } });
}

describe('BookingForm date rules', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 10, 18, 10, 0));
        mockCreateBooking.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('limits the date inputs to the allowed window', () => {
        renderWithProviders(<BookingForm carId={1} />);

        const start = screen.getByLabelText('Start Date');
        const end = screen.getByLabelText('End Date');

        expect(start).toHaveAttribute('min', '2026-11-18');
        expect(start).toHaveAttribute('max', '2027-05-17');
        expect(end).toHaveAttribute('min', '2026-11-19');
        expect(end).toHaveAttribute('max', '2027-06-15');
    });

    it('narrows the end date window once a start date is chosen', () => {
        renderWithProviders(<BookingForm carId={1} />);

        setDate(screen.getByLabelText('Start Date'), '2026-12-01');

        const end = screen.getByLabelText('End Date');
        expect(end).toHaveAttribute('min', '2026-12-02');
        expect(end).toHaveAttribute('max', '2026-12-30');
    });

    it('blocks a rental longer than 30 days before calling the API', async () => {
        renderWithProviders(<BookingForm carId={1} />);

        setDate(screen.getByLabelText('Start Date'), '2026-12-01');
        setDate(screen.getByLabelText('End Date'), '2027-01-15');
        submit();

        expect(await screen.findByText('Rental cannot be longer than 30 days')).toBeInTheDocument();
        expect(mockCreateBooking).not.toHaveBeenCalled();
    });

    it('blocks a start date more than 180 days ahead', async () => {
        renderWithProviders(<BookingForm carId={1} />);

        setDate(screen.getByLabelText('Start Date'), '2027-06-01');
        setDate(screen.getByLabelText('End Date'), '2027-06-03');
        submit();

        expect(await screen.findByText('Start date cannot be more than 180 days ahead')).toBeInTheDocument();
        expect(mockCreateBooking).not.toHaveBeenCalled();
    });

    it('blocks an end date that is not after the start date', async () => {
        renderWithProviders(<BookingForm carId={1} />);

        setDate(screen.getByLabelText('Start Date'), '2026-12-05');
        setDate(screen.getByLabelText('End Date'), '2026-12-05');
        submit();

        expect(await screen.findByText('End date must be after start date')).toBeInTheDocument();
        expect(mockCreateBooking).not.toHaveBeenCalled();
    });

    it('shows the open request cap returned by the API', async () => {
        mockCreateBooking.mockRejectedValueOnce(
            new ApiError({
                status: 409,
                message: 'You already have 3 open rental requests.',
                timestamp: new Date().toISOString(),
                code: 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED',
            })
        );
        renderWithProviders(<BookingForm carId={1} />);

        setDate(screen.getByLabelText('Start Date'), '2026-12-01');
        setDate(screen.getByLabelText('End Date'), '2026-12-05');
        submit();

        await waitFor(() => expect(screen.getByText(/3 open rental requests/)).toBeInTheDocument());
        expect(mockCreateBooking).toHaveBeenCalledWith(
            expect.objectContaining({ startDate: '2026-12-01', endDate: '2026-12-05' })
        );
    });
});
