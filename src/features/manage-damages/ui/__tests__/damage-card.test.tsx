import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { DamageCard } from '../damage-card';

describe('DamageCard', () => {
    it('shows the plate and the description of the report', () => {
        const damage = createMockDamage({ carLicensePlate: '35 ABC 123', carSummary: undefined, description: 'Scratch on the left door' });

        render(<DamageCard damage={damage} />);

        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
        expect(screen.getByText('Scratch on the left door')).toBeInTheDocument();
    });

    it('names the vehicle by make and model next to the plate from the report itself', () => {
        const carSummary = { id: 5, brand: 'Toyota', model: 'Corolla', licensePlate: '35 ABC 123' };

        render(<DamageCard damage={createMockDamage({ carLicensePlate: '35 ABC 123', carSummary })} />);

        expect(screen.getByText('Toyota Corolla (35 ABC 123)')).toBeInTheDocument();
    });

    it('links to the damage report so keyboards can open it', () => {
        render(<DamageCard damage={createMockDamage({ id: 9, carLicensePlate: '34 XYZ 9' })} href="/damages/9" />);

        expect(screen.getByRole('link')).toHaveAttribute('href', '/damages/9');
    });

    it('offers the dispute action for charged damages', async () => {
        const onDispute = vi.fn();
        const damage = createMockDamage({ status: 'CHARGED' });
        render(<DamageCard damage={damage} href="/damages/1" onDispute={onDispute} />);

        await userEvent.click(screen.getByRole('button', { name: /dispute charge/i }));

        expect(onDispute).toHaveBeenCalledWith(damage);
    });

    it('hides the dispute action for damages that are not charged', () => {
        render(<DamageCard damage={createMockDamage({ status: 'ASSESSED' })} href="/damages/1" onDispute={vi.fn()} />);

        expect(screen.queryByRole('button', { name: /dispute charge/i })).not.toBeInTheDocument();
    });

    it('shows the liability in the damage currency', () => {
        render(<DamageCard damage={createMockDamage({ customerLiability: 250, currency: 'EUR' })} />);

        expect(screen.getByText(/€250.00/)).toBeInTheDocument();
    });
});
