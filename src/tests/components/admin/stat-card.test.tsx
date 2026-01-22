'use client';

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { TrendingUp, DollarSign, Car } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { renderWithProviders } from '../../test-utils';

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
        expect(screen.getByText('+12%')).toHaveClass('text-green-600');
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
        expect(screen.getByText('-8%')).toHaveClass('text-red-600');
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
});
