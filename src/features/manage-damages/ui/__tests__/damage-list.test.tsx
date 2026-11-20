import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { DamageList } from '../damage-list';

const mockUseCar = vi.hoisted(() => vi.fn(() => ({ data: undefined as { car: { brand: string; model: string } } | undefined })));

vi.mock('@/entities/car/api/use-cars', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/entities/car/api/use-cars')>()),
    useCar: mockUseCar,
}));

vi.mock('../damage-dispute-form', () => ({
    DamageDisputeForm: ({ damageId, open }: { damageId: number; open: boolean }) =>
        open ? <div role="dialog">Dispute for {damageId}</div> : null,
}));

describe('DamageList', () => {
    it('links every card to its report', () => {
        render(
            <DamageList
                damages={[
                    createMockDamage({ id: 1, carLicensePlate: 'AAA 111' }),
                    createMockDamage({ id: 2, carLicensePlate: 'BBB 222' }),
                ]}
            />
        );

        const links = screen.getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href'))).toEqual(['/damages/1', '/damages/2']);
    });

    it('opens the dispute dialog for the charged damage that was chosen', async () => {
        render(
            <DamageList
                damages={[
                    createMockDamage({ id: 1, status: 'ASSESSED' }),
                    createMockDamage({ id: 2, status: 'CHARGED' }),
                ]}
            />
        );

        expect(screen.getAllByRole('button', { name: /dispute charge/i })).toHaveLength(1);
        await userEvent.click(screen.getByRole('button', { name: /dispute charge/i }));

        expect(screen.getByRole('dialog')).toHaveTextContent('Dispute for 2');
    });

    it('shows the empty state', () => {
        render(<DamageList damages={[]} />);

        expect(screen.getByText('No damage reports found')).toBeInTheDocument();
    });
});
