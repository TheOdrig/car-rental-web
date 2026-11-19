import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RentalActions, RentalActionsSkeleton } from '@/features/manage-rentals';
import type { Rental } from '@/entities/rental';
import { RentalStatus } from '@/entities/rental';
const createMockRental = (status: RentalStatus): Rental => ({
    id: 1,
    carSummary: {
        id: 1,
        licensePlate: 'ABC-123',
        brand: 'Toyota',
        model: 'Camry',
    },
    userSummary: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
    },
    startDate: '2025-01-01',
    paymentOpensOn: '2024-12-27',
    endDate: '2025-01-05',
    days: 4,
    dailyPrice: 50,
    totalPrice: 200,
    currency: 'USD',
    status,
    createTime: '2024-12-25T10:00:00Z',
    updateTime: '2024-12-25T10:00:00Z',
});
describe('RentalActions', () => {
    const mockOnAction = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('payment window from the server date', () => {
        it('disables Pay Now with the date until paymentOpensOn', () => {
            render(
                <RentalActions
                    rental={{ ...createMockRental(RentalStatus.CONFIRMED), paymentOpensOn: '2999-03-04' }}
                    onAction={mockOnAction}
                />
            );
            const pay = screen.getByRole('button', { name: /pay now/i });
            expect(pay).toBeDisabled();
            expect(pay).toHaveAttribute('title', 'Payment opens on Mar 4, 2999');
        });
        it('enables Pay Now once paymentOpensOn has passed', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.CONFIRMED)}
                    onAction={mockOnAction}
                />
            );
            expect(screen.getByRole('button', { name: /pay now/i })).toBeEnabled();
        });
    });
    describe('button rendering by status', () => {
        it('should render View Details for In Use status', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.IN_USE)}
                    onAction={mockOnAction}
                />
            );
            expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
        });
        it('should render View Details for Confirmed status', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.CONFIRMED)}
                    onAction={mockOnAction}
                />
            );
            expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
        });
        it('should render only Book Again for Returned status', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.RETURNED)}
                    onAction={mockOnAction}
                />
            );
            expect(screen.queryByRole('button', { name: /receipt/i })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /book again/i })).toBeInTheDocument();
        });
        it('should render View Details and Cancel for Requested status', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.REQUESTED)}
                    onAction={mockOnAction}
                />
            );
            expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
        it('should render no buttons for Cancelled status', () => {
            const { container } = render(
                <RentalActions
                    rental={createMockRental(RentalStatus.CANCELLED)}
                    onAction={mockOnAction}
                />
            );
            expect(container.querySelector('[role="group"]')).not.toBeInTheDocument();
        });
        it('should use status prop over rental.status when provided', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.CANCELLED)}
                    status={RentalStatus.IN_USE}
                    onAction={mockOnAction}
                />
            );
            expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
        });
    });
    describe('button click handlers', () => {
        it('should call onAction with correct action and rental', async () => {
            const user = userEvent.setup();
            const rental = createMockRental(RentalStatus.IN_USE);
            render(<RentalActions rental={rental} onAction={mockOnAction} />);
            await user.click(screen.getByRole('button', { name: /view details/i }));
            expect(mockOnAction).toHaveBeenCalledWith('view', rental);
        });
        it('should call onAction for each button click', async () => {
            const user = userEvent.setup();
            const rental = createMockRental(RentalStatus.RETURNED);
            render(<RentalActions rental={rental} onAction={mockOnAction} />);
            await user.click(screen.getByRole('button', { name: /book again/i }));
            expect(mockOnAction).toHaveBeenCalledWith('book-again', rental);
        });
        it('should prevent event propagation', async () => {
            const user = userEvent.setup();
            const containerClick = vi.fn();
            const rental = createMockRental(RentalStatus.IN_USE);
            render(
                <div onClick={containerClick}>
                    <RentalActions rental={rental} onAction={mockOnAction} />
                </div>
            );
            await user.click(screen.getByRole('button', { name: /view details/i }));
            expect(containerClick).not.toHaveBeenCalled();
        });
    });
    describe('loading states', () => {
        it('should show loading spinner during async action', async () => {
            const user = userEvent.setup();
            let finish: () => void = () => undefined;
            const asyncAction = vi.fn(
                (): Promise<void> => new Promise((resolve) => { finish = resolve; })
            );
            const rental = createMockRental(RentalStatus.IN_USE);
            render(<RentalActions rental={rental} onAction={asyncAction} />);
            const button = screen.getByRole('button', { name: /view details/i });
            await user.click(button);
            expect(button).toBeDisabled();
            finish();
            await waitFor(() => {
                expect(button).not.toBeDisabled();
            });
        });
        it('should disable button while loading', async () => {
            const user = userEvent.setup();
            let finish: () => void = () => undefined;
            const asyncAction = vi.fn(
                (): Promise<void> => new Promise((resolve) => { finish = resolve; })
            );
            const rental = createMockRental(RentalStatus.IN_USE);
            render(<RentalActions rental={rental} onAction={asyncAction} />);
            await user.click(screen.getByRole('button', { name: /view details/i }));
            expect(screen.getByRole('button', { name: /view details/i })).toBeDisabled();
            finish();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /view details/i })).not.toBeDisabled();
            });
        });
        it('should re-enable button after action completes', async () => {
            const user = userEvent.setup();
            const asyncAction = vi.fn(() => Promise.resolve());
            const rental = createMockRental(RentalStatus.IN_USE);
            render(<RentalActions rental={rental} onAction={asyncAction} />);
            await user.click(screen.getByRole('button', { name: /view details/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /view details/i })).not.toBeDisabled();
            });
        });
    });
    describe('orientation', () => {
        it('should apply horizontal layout by default', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.IN_USE)}
                    onAction={mockOnAction}
                />
            );
            const group = screen.getByRole('group');
            expect(group).not.toHaveClass('flex-col');
        });
        it('should apply vertical layout when specified', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.IN_USE)}
                    onAction={mockOnAction}
                    orientation="vertical"
                />
            );
            const group = screen.getByRole('group');
            expect(group).toHaveClass('flex-col');
        });
    });
    describe('accessibility', () => {
        it('should have role group with aria-label', () => {
            render(
                <RentalActions
                    rental={createMockRental(RentalStatus.IN_USE)}
                    onAction={mockOnAction}
                />
            );
            const group = screen.getByRole('group');
            expect(group).toHaveAttribute('aria-label', 'Rental actions');
        });
    });
});
describe('RentalActionsSkeleton', () => {
    it('should render default 2 skeleton buttons', () => {
        render(<RentalActionsSkeleton />);
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons).toHaveLength(2);
    });
    it('should render specified count of skeleton buttons', () => {
        render(<RentalActionsSkeleton count={3} />);
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons).toHaveLength(3);
    });
    it('should apply vertical orientation', () => {
        const { container } = render(<RentalActionsSkeleton orientation="vertical" />);
        expect(container.firstChild).toHaveClass('flex-col');
    });
});