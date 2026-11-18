import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { DamageCard } from '../damage-card';

describe('DamageCard', () => {
    it('shows the plate and the description of the report', () => {
        const damage = createMockDamage({ carLicensePlate: '35 ABC 123', description: 'Scratch on the left door' });

        render(<DamageCard damage={damage} />);

        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
        expect(screen.getByText('Scratch on the left door')).toBeInTheDocument();
    });

    it('calls onClick when the card is pressed', async () => {
        const onClick = vi.fn();
        render(<DamageCard damage={createMockDamage({ carLicensePlate: '34 XYZ 9' })} onClick={onClick} />);

        await userEvent.click(screen.getByText('34 XYZ 9'));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
