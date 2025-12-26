import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RentalTabs } from '@/components/rentals/rental-tabs';
import type { RentalTab, RentalTabCounts } from '@/types';

const mockCounts: RentalTabCounts = {
    all: 10,
    active: 2,
    upcoming: 3,
    completed: 4,
    cancelled: 1,
};

describe('RentalTabs', () => {
    const mockOnTabChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render all five tabs', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /upcoming/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /cancelled/i })).toBeInTheDocument();
        });

        it('should render tablist role', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('should display count for each tab', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                    className="custom-class"
                />
            );

            expect(screen.getByRole('tablist')).toHaveClass('custom-class');
        });
    });

    describe('active tab indication', () => {
        it('should mark active tab as selected', () => {
            render(
                <RentalTabs
                    activeTab="active"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            const activeTab = screen.getByRole('tab', { name: /active/i });
            expect(activeTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should mark inactive tabs as not selected', () => {
            render(
                <RentalTabs
                    activeTab="active"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            const allTab = screen.getByRole('tab', { name: /all/i });
            const completedTab = screen.getByRole('tab', { name: /completed/i });

            expect(allTab).toHaveAttribute('aria-selected', 'false');
            expect(completedTab).toHaveAttribute('aria-selected', 'false');
        });

        it.each<RentalTab>(['all', 'active', 'upcoming', 'completed', 'cancelled'])(
            'should correctly indicate %s as active tab',
            (tab) => {
                render(
                    <RentalTabs
                        activeTab={tab}
                        onTabChange={mockOnTabChange}
                        counts={mockCounts}
                    />
                );

                const tabs = screen.getAllByRole('tab');
                const activeTab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
                expect(activeTab).toHaveAttribute('id', `tab-${tab}`);
            }
        );
    });

    describe('tab switching', () => {
        it('should call onTabChange when tab is clicked', async () => {
            const user = userEvent.setup();
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            await user.click(screen.getByRole('tab', { name: /active/i }));
            expect(mockOnTabChange).toHaveBeenCalledWith('active');
        });

        it('should call onTabChange with correct tab value for each tab', async () => {
            const user = userEvent.setup();
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            await user.click(screen.getByRole('tab', { name: /upcoming/i }));
            expect(mockOnTabChange).toHaveBeenCalledWith('upcoming');

            await user.click(screen.getByRole('tab', { name: /completed/i }));
            expect(mockOnTabChange).toHaveBeenCalledWith('completed');

            await user.click(screen.getByRole('tab', { name: /cancelled/i }));
            expect(mockOnTabChange).toHaveBeenCalledWith('cancelled');
        });

        it('should call onTabChange when clicking on already active tab', async () => {
            const user = userEvent.setup();
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            await user.click(screen.getByRole('tab', { name: /all/i }));
            expect(mockOnTabChange).toHaveBeenCalledWith('all');
        });
    });

    describe('accessibility', () => {
        it('should have proper aria-controls attribute', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            const allTab = screen.getByRole('tab', { name: /all/i });
            expect(allTab).toHaveAttribute('aria-controls', 'tabpanel-all');
        });

        it('should have proper id for each tab', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            expect(screen.getByRole('tab', { name: /all/i })).toHaveAttribute('id', 'tab-all');
            expect(screen.getByRole('tab', { name: /active/i })).toHaveAttribute('id', 'tab-active');
            expect(screen.getByRole('tab', { name: /upcoming/i })).toHaveAttribute('id', 'tab-upcoming');
        });

        it('should have aria-label on tablist', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Filter rentals by status');
        });

        it('should have button type on tabs', () => {
            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={mockCounts}
                />
            );

            const tabs = screen.getAllByRole('tab');
            tabs.forEach((tab) => {
                expect(tab).toHaveAttribute('type', 'button');
            });
        });
    });

    describe('edge cases', () => {
        it('should handle zero counts', () => {
            const zeroCounts: RentalTabCounts = {
                all: 0,
                active: 0,
                upcoming: 0,
                completed: 0,
                cancelled: 0,
            };

            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={zeroCounts}
                />
            );

            const zeroElements = screen.getAllByText('0');
            expect(zeroElements).toHaveLength(5);
        });

        it('should handle large counts', () => {
            const largeCounts: RentalTabCounts = {
                all: 1000,
                active: 500,
                upcoming: 250,
                completed: 200,
                cancelled: 50,
            };

            render(
                <RentalTabs
                    activeTab="all"
                    onTabChange={mockOnTabChange}
                    counts={largeCounts}
                />
            );

            expect(screen.getByText('1000')).toBeInTheDocument();
            expect(screen.getByText('500')).toBeInTheDocument();
        });
    });
});
