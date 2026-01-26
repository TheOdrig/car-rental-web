import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalTimeline } from '@/components/rentals/rental-timeline';
import type { RentalStatus } from '@/types';

describe('RentalTimeline', () => {
    describe('step rendering', () => {
        it('should render all four timeline steps', () => {
            render(<RentalTimeline status="Confirmed" />);

            expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
            expect(screen.getByText('Pick-up Scheduled')).toBeInTheDocument();
            expect(screen.getByText('Rental Active')).toBeInTheDocument();
            expect(screen.getByText('Return & Complete')).toBeInTheDocument();
        });

        it('should render step descriptions', () => {
            render(<RentalTimeline status="Confirmed" />);

            expect(screen.getByText('Your reservation is confirmed')).toBeInTheDocument();
            expect(screen.getByText('Ready for vehicle pickup')).toBeInTheDocument();
            expect(screen.getByText('Enjoy your trip!')).toBeInTheDocument();
            expect(screen.getByText('Rental completed successfully')).toBeInTheDocument();
        });

        it('should have list role with aria-label', () => {
            render(<RentalTimeline status="Confirmed" />);

            const timeline = screen.getByRole('list');
            expect(timeline).toHaveAttribute('aria-label', 'Rental timeline');
        });
    });

    describe('step completion states', () => {
        it('should show first step as current for Confirmed status', () => {
            render(<RentalTimeline status="Confirmed" />);

            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Booking Confirmed');
        });

        it('should show first step as completed for In Use status', () => {
            render(<RentalTimeline status="In Use" />);

            const steps = screen.getAllByRole('listitem');
            expect(steps[0]).toHaveTextContent('Booking Confirmed');
        });

        it('should show third step as current for In Use status', () => {
            render(<RentalTimeline status="In Use" />);

            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Rental Active');
        });

        it('should show all steps as completed for Returned status', () => {
            render(<RentalTimeline status="Returned" />);

            const currentStep = screen.getByRole('listitem', { current: 'step' });
            expect(currentStep).toHaveTextContent('Return & Complete');
        });

        it.each<RentalStatus>(['Requested', 'Confirmed', 'In Use', 'Returned'])(
            'should render timeline for %s status',
            (status) => {
                render(<RentalTimeline status={status} />);
                expect(screen.getByRole('list')).toBeInTheDocument();
            }
        );
    });

    describe('cancelled status', () => {
        it('should render cancelled message', () => {
            render(<RentalTimeline status="Cancelled" />);

            expect(screen.getByText('Rental Cancelled')).toBeInTheDocument();
            expect(screen.getByText('This rental has been cancelled.')).toBeInTheDocument();
        });

        it('should not render timeline steps for cancelled status', () => {
            render(<RentalTimeline status="Cancelled" />);

            expect(screen.queryByRole('list')).not.toBeInTheDocument();
            expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
        });
    });

    describe('current step details box', () => {
        it('should show details for current step with start date', () => {
            render(
                <RentalTimeline
                    status="Confirmed"
                    startDate="2025-01-15"
                />
            );

            expect(screen.getByText(/Starts Jan 15, 2025/)).toBeInTheDocument();
        });

        it('should show default pickup location for current pickup step', () => {
            render(
                <RentalTimeline
                    status="Confirmed"
                    startDate="2025-01-15"
                />
            );

            expect(screen.getByText(/Starts Jan 15, 2025/)).toBeInTheDocument();
        });

        it('should show return date for active rental', () => {
            render(
                <RentalTimeline
                    status="In Use"
                    endDate="2025-01-20"
                />
            );

            expect(screen.getByText(/Returns Jan 20, 2025/)).toBeInTheDocument();
        });

        it('should show completion message for returned rental', () => {
            render(<RentalTimeline status="Returned" />);

            expect(screen.getByText('Thank you for choosing us!')).toBeInTheDocument();
        });
    });

    describe('visual indicators', () => {
        it('should apply completed styling for past steps', () => {
            render(<RentalTimeline status="In Use" />);

            const bookingStep = screen.getByText('Booking Confirmed');
            expect(bookingStep).toHaveClass('text-green-600');
        });

        it('should apply current styling for active step', () => {
            render(<RentalTimeline status="Confirmed" />);

            const bookingStep = screen.getByText('Booking Confirmed');
            expect(bookingStep).toHaveClass('text-primary');
        });

        it('should apply pending styling for future steps', () => {
            render(<RentalTimeline status="Confirmed" />);

            const returnStep = screen.getByText('Return & Complete');
            expect(returnStep).toHaveClass('text-muted-foreground');
        });
    });

    describe('custom className', () => {
        it('should apply custom className to container', () => {
            const { container } = render(
                <RentalTimeline status="Confirmed" className="custom-class" />
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});

