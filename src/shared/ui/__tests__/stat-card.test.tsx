'use client';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Car } from 'lucide-react';
import { StatCard } from '@/shared/ui/stat-card';
import { renderWithProviders } from '@/app/testing/test-utils';
describe('StatCard', () => {
    it('should render label and value', () => {
        renderWithProviders(<StatCard label="Total Rentals" value={42} />);
        expect(screen.getByText('Total Rentals')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });
    it('should render string values correctly', () => {
        renderWithProviders(<StatCard label="Revenue" value="$1,234.56" />);
        expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });
    it('should render icon when provided', () => {
        renderWithProviders(<StatCard label="Total Vehicles" value={15} icon={Car} />);
        const icon = document.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });
    it('should render positive trend correctly', () => {
        renderWithProviders(
            <StatCard
                label="Revenue"
                value="$5,000"
                trend={{ value: 12, isPositive: true }}
            />
        );
        expect(screen.getByText('+12%')).toBeInTheDocument();
        expect(screen.getByText('+12%')).toHaveClass('text-success-subtle-foreground');
    });
    it('should render negative trend correctly', () => {
        renderWithProviders(
            <StatCard
                label="Cancellations"
                value={5}
                trend={{ value: -8, isPositive: false }}
            />
        );
        expect(screen.getByText('-8%')).toBeInTheDocument();
        expect(screen.getByText('-8%')).toHaveClass('text-danger-subtle-foreground');
    });
    it('should not render trend when not provided', () => {
        renderWithProviders(<StatCard label="Test" value={10} />);
        expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
    it('should apply custom className', () => {
        const { container } = renderWithProviders(
            <StatCard label="Test" value={10} className="custom-class" />
        );
        const card = container.firstChild;
        expect(card).toHaveClass('custom-class');
    });
    it('should render zero value correctly', () => {
        renderWithProviders(<StatCard label="Damages" value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });
    it('should handle large numbers', () => {
        renderWithProviders(<StatCard label="Total Spent" value="$1,234,567.89" />);
        expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    });
    it('should render a hint under the value', () => {
        renderWithProviders(<StatCard label="Maintenance" value={3} hint="12% of total" />);
        expect(screen.getByText('12% of total')).toBeInTheDocument();
    });
    it('should keep the icon and the tone dot out of the accessibility tree', () => {
        const { container } = renderWithProviders(<StatCard label="Rented" value={1} icon={Car} tone="info" />);
        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    });
    it('should become a button when it is clickable', async () => {
        const onClick = vi.fn();
        renderWithProviders(<StatCard label="Approvals" value={4} onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
    it('should not expose a button when it is static', () => {
        renderWithProviders(<StatCard label="Approvals" value={4} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
    it('should show the trend label next to the percentage', () => {
        renderWithProviders(<StatCard label="Revenue" value="$5" trend={{ value: 4, isPositive: true, label: 'vs last month' }} />);
        expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
});
