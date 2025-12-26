import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProtectionExtras } from '@/components/checkout/protection-extras';
import { DEFAULT_ADDONS } from '@/lib/utils/checkout-utils';
import type { Addon } from '@/types';

const mockAddons: Addon[] = [
    {
        id: 'cdw',
        name: 'Collision Damage Waiver',
        description: 'Full coverage for collision damage.',
        pricePerDay: 15,
        icon: 'shield-check',
        popular: true,
    },
    {
        id: 'gps',
        name: 'GPS Navigation',
        description: 'Reliable navigation system.',
        pricePerDay: 5,
        icon: 'navigation',
        popular: false,
    },
];

describe('ProtectionExtras', () => {
    const user = userEvent.setup();

    it('should render section header', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Protection & Extras')).toBeInTheDocument();
    });

    it('should render all addon cards', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('Collision Damage Waiver')).toBeInTheDocument();
        expect(screen.getByText('GPS Navigation')).toBeInTheDocument();
    });

    it('should display addon prices per day', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('+$15')).toBeInTheDocument();
        expect(screen.getByText('+$5')).toBeInTheDocument();
    });

    it('should display total cost for multi-day rentals', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('$45.00 total')).toBeInTheDocument();
        expect(screen.getByText('$15.00 total')).toBeInTheDocument();
    });

    it('should show popular badge for popular addons', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('Popular')).toBeInTheDocument();
    });

    it('should display addon descriptions', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText('Full coverage for collision damage.')).toBeInTheDocument();
        expect(screen.getByText('Reliable navigation system.')).toBeInTheDocument();
    });

    it('should call onAddonChange when addon is selected', async () => {
        const onAddonChange = vi.fn();

        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={[]}
                onAddonChange={onAddonChange}
                rentalDays={3}
            />
        );

        const cdwCheckbox = screen.getByRole('checkbox', { name: /collision damage waiver/i });
        await user.click(cdwCheckbox);

        expect(onAddonChange).toHaveBeenCalledWith('cdw', true);
    });

    it('should call onAddonChange when addon is deselected', async () => {
        const onAddonChange = vi.fn();

        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={['cdw']}
                onAddonChange={onAddonChange}
                rentalDays={3}
            />
        );

        const cdwCheckbox = screen.getByRole('checkbox', { name: /collision damage waiver/i });
        await user.click(cdwCheckbox);

        expect(onAddonChange).toHaveBeenCalledWith('cdw', false);
    });

    it('should show selected state for selected addons', () => {
        render(
            <ProtectionExtras
                addons={mockAddons}
                selectedAddons={['cdw']}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        const cdwCheckbox = screen.getByRole('checkbox', { name: /collision damage waiver/i });
        const gpsCheckbox = screen.getByRole('checkbox', { name: /gps navigation/i });

        expect(cdwCheckbox).toBeChecked();
        expect(gpsCheckbox).not.toBeChecked();
    });

    it('should render empty state when no addons', () => {
        render(
            <ProtectionExtras
                addons={[]}
                selectedAddons={[]}
                onAddonChange={vi.fn()}
                rentalDays={3}
            />
        );

        expect(screen.getByText(/no additional options available/i)).toBeInTheDocument();
    });

    it('should use DEFAULT_ADDONS from checkout-utils', () => {
        expect(DEFAULT_ADDONS.length).toBeGreaterThan(0);
        expect(DEFAULT_ADDONS.some((addon) => addon.id === 'cdw')).toBe(true);
    });
});
