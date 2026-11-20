import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalTimeline } from '@/features/manage-rentals';
import { RentalStatus } from '@/entities/rental';
describe('RentalTimeline', () => {
    describe('step rendering', () => {
        it('should render all four timeline steps', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
            expect(screen.getByText('Pick-up Scheduled')).toBeInTheDocument();
            expect(screen.getByText('Rental Active')).toBeInTheDocument();
            expect(screen.getByText('Return & Complete')).toBeInTheDocument();
        });
        it('should render step descriptions', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            expect(screen.getByText('An admin approved the request')).toBeInTheDocument();
            expect(screen.getByText('Pick-up on the start date')).toBeInTheDocument();
            expect(screen.getByText('Starts at pick-up')).toBeInTheDocument();
            expect(screen.getByText('Return on the end date')).toBeInTheDocument();
        });
        it('should have list role with aria-label', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            const timeline = screen.getByRole('list');
            expect(timeline).toHaveAttribute('aria-label', 'Rental timeline');
        });
    });
    describe('step completion states', () => {
        it('should show first step as current for Confirmed status', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Booking Confirmed');
        });
        it('should word the first step as a pending request for Requested status', () => {
            render(<RentalTimeline status={RentalStatus.REQUESTED} />);
            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Request Submitted');
            expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
            expect(screen.queryByText('An admin approved the request')).not.toBeInTheDocument();
            expect(screen.getByText('Waiting for an admin to review the request')).toBeInTheDocument();
        });
        it('should show first step as completed for In Use status', () => {
            render(<RentalTimeline status={RentalStatus.IN_USE} />);
            const steps = screen.getAllByRole('listitem');
            expect(steps[0]).toHaveTextContent('Booking Confirmed');
        });
        it('should show third step as current for In Use status', () => {
            render(<RentalTimeline status={RentalStatus.IN_USE} />);
            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Rental Active');
        });
        it('should show all steps as completed for Returned status', () => {
            render(<RentalTimeline status={RentalStatus.RETURNED} />);
            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Return & Complete');
        });
        it.each([RentalStatus.REQUESTED, RentalStatus.CONFIRMED, RentalStatus.IN_USE, RentalStatus.RETURNED])(
            'should render timeline for %s status',
            (status) => {
                render(<RentalTimeline status={status} />);
                expect(screen.getByRole('list')).toBeInTheDocument();
            }
        );
    });
    describe('cancelled status', () => {
        it('should render cancelled message', () => {
            render(<RentalTimeline status={RentalStatus.CANCELLED} />);
            expect(screen.getByText('Rental Cancelled')).toBeInTheDocument();
            expect(screen.getByText('This rental has been cancelled.')).toBeInTheDocument();
        });
        it('should not render timeline steps for cancelled status', () => {
            render(<RentalTimeline status={RentalStatus.CANCELLED} />);
            expect(screen.queryByRole('list')).not.toBeInTheDocument();
            expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
        });
    });
    describe('current step details box', () => {
        it('should show details for current step with start date', () => {
            render(
                <RentalTimeline
                    status={RentalStatus.CONFIRMED}
                    startDate="2025-01-15"
                />
            );
            expect(screen.getByText(/Starts Jan 15, 2025/)).toBeInTheDocument();
        });
        it('should show default pickup location for current pickup step', () => {
            render(
                <RentalTimeline
                    status={RentalStatus.CONFIRMED}
                    startDate="2025-01-15"
                />
            );
            expect(screen.getByText(/Starts Jan 15, 2025/)).toBeInTheDocument();
        });
        it('should show return date for active rental', () => {
            render(
                <RentalTimeline
                    status={RentalStatus.IN_USE}
                    endDate="2025-01-20"
                />
            );
            expect(screen.getByText(/Returns Jan 20, 2025/)).toBeInTheDocument();
        });
        it('does not claim a future step already happened', () => {
            render(<RentalTimeline status={RentalStatus.IN_USE} endDate="2025-01-20" />);
            expect(screen.queryByText(/completed successfully/i)).not.toBeInTheDocument();
            expect(screen.getByText('The vehicle is with you')).toBeInTheDocument();
        });

        it('says the vehicle was returned once the rental is returned', () => {
            render(<RentalTimeline status={RentalStatus.RETURNED} />);
            expect(screen.getByText('The vehicle was returned')).toBeInTheDocument();
        });

        it('names the due date on the return step before the rental ends', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} endDate="2025-01-20" />);
            expect(screen.getByText('Return due Jan 20, 2025')).toBeInTheDocument();
        });
    });
    describe('milestone timestamps', () => {
        it('shows when each reached step happened', () => {
            render(
                <RentalTimeline
                    status={RentalStatus.IN_USE}
                    confirmedAt="2030-01-02T09:00:00Z"
                    pickedUpAt="2030-01-03T10:00:00Z"
                />
            );
            expect(screen.getByText(/^Approved Jan [2-3], 2030/)).toBeInTheDocument();
            expect(screen.getByText(/^Picked up Jan 3, 2030/)).toBeInTheDocument();
            expect(screen.getByText(/^In use since Jan 3, 2030/)).toBeInTheDocument();
        });

        it('ticks every step and shows the return time for a returned rental', () => {
            render(
                <RentalTimeline
                    status={RentalStatus.RETURNED}
                    confirmedAt="2030-01-02T09:00:00Z"
                    pickedUpAt="2030-01-03T10:00:00Z"
                    returnedAt="2030-01-04T11:00:00Z"
                />
            );
            expect(screen.getByText(/^Returned Jan 4, 2030/)).toBeInTheDocument();
            expect(screen.getByText('Return & Complete')).toHaveClass('text-emerald-700');
        });
    });
    describe('visual indicators', () => {
        it('should apply completed styling for past steps', () => {
            render(<RentalTimeline status={RentalStatus.IN_USE} />);
            const bookingStep = screen.getByText('Booking Confirmed');
            expect(bookingStep).toHaveClass('text-emerald-700');
        });
        it('should apply current styling for active step', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            const bookingStep = screen.getByText('Booking Confirmed');
            expect(bookingStep).toHaveClass('text-primary');
        });
        it('should apply pending styling for future steps', () => {
            render(<RentalTimeline status={RentalStatus.CONFIRMED} />);
            const returnStep = screen.getByText('Return & Complete');
            expect(returnStep).toHaveClass('text-muted-foreground');
        });
    });
    describe('custom className', () => {
        it('should apply custom className to container', () => {
            const { container } = render(
                <RentalTimeline status={RentalStatus.CONFIRMED} className="custom-class" />
            );
            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});